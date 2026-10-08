// 読み取り専用スクリプト: フレーム内の入力フォームの「構造」だけを取得する。
// 値の入力・クリック・フォーカス・イベント発火・DOM変更は一切行わない。
(() => {
  const MAX_NODES = 40000;
  const CONTROL_SEL = 'input, select, textarea, [contenteditable=""], [contenteditable="true"], [role="textbox"]';
  const SKIP_TEXT_SEL = 'input, select, textarea, option, script, style, noscript, button, svg';

  const clean = (s) => (s || '').replace(/[ \t 　]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  const cut = (s, n) => (s.length > n ? s.slice(0, n) : s);

  // 制御要素や script を除いた、見えるテキスト（DOMは変更せず再帰で集める）
  const textWithout = (node, limit) => {
    let out = '';
    const rec = (n) => {
      if (out.length > limit) return;
      if (n.nodeType === 3) {
        out += n.nodeValue;
      } else if (n.nodeType === 1) {
        if (n.matches && n.matches(SKIP_TEXT_SEL)) return;
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const isBlock = /^(block|flex|grid|table|list-item|table-row|table-cell)/.test(cs.display);
        if (isBlock || n.tagName === 'BR') out += '\n';
        for (const c of n.childNodes) rec(c);
        if (isBlock) out += '\n';
        // 疑似要素(::before/::after)が「必須」「*」などを描いている場合に拾う
        for (const pseudo of ['::before', '::after']) {
          const content = getComputedStyle(n, pseudo).content;
          if (content && content !== 'none' && content !== 'normal' && content !== '""') {
            const m = /^["'](.*)["']$/.exec(content);
            if (m && m[1]) out += ' ' + m[1] + ' ';
          }
        }
      } else if (n.nodeType === 11) {
        for (const c of n.childNodes) rec(c);
      }
    };
    rec(node);
    return clean(out);
  };

  const isVisibleBox = (el) => {
    if (!el.isConnected) return false;
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkVisibilityCSS: true })) return false;
    } else {
      const cs0 = getComputedStyle(el);
      if (cs0.display === 'none' || cs0.visibility === 'hidden') return false;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 1 && r.height <= 1) return false;
    // 画面外に追い出されたもの（botよけのおとり欄に多い）
    if (r.right + window.scrollX < -50 || r.bottom + window.scrollY < -50) return false;
    return true;
  };

  const ariaHiddenTrap = (el) => {
    const h = el.closest('[aria-hidden="true"]');
    return !!h && (el.getAttribute('tabindex') === '-1' || h.getAttribute('tabindex') === '-1');
  };

  const isVisibleControl = (el, kind) => {
    if (ariaHiddenTrap(el)) return false;
    if (isVisibleBox(el)) {
      const cs = getComputedStyle(el);
      if (kind === 'text' && cs.opacity === '0') return false;
      return true;
    }
    // ラジオ/チェック/ファイルは見た目だけ隠して label を表示していることが多い
    if (kind === 'choice' || kind === 'file') {
      const labels = el.labels ? Array.from(el.labels) : [];
      const wrapper = el.closest('label');
      if (wrapper && !labels.includes(wrapper)) labels.push(wrapper);
      return labels.some((l) => isVisibleBox(l));
    }
    return false;
  };

  // 開いている Shadow DOM を含めて、DOM順に入力要素を集める
  const controls = [];
  let nodeCount = 0;
  const walk = (root, inShadow) => {
    for (const el of root.children) {
      if (++nodeCount > MAX_NODES) return;
      if (el.matches(CONTROL_SEL)) controls.push({ el, inShadow });
      if (el.shadowRoot) walk(el.shadowRoot, true);
      walk(el, inShadow);
    }
  };
  walk(document.documentElement, false);

  const typeOf = (el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'select') return 'select';
    if (tag === 'textarea') return 'textarea';
    if (tag === 'input') return (el.getAttribute('type') || 'text').toLowerCase();
    return 'contenteditable';
  };

  const SKIP_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

  const labelsOf = (el) => {
    const out = [];
    const labels = el.labels ? Array.from(el.labels) : [];
    for (const l of labels) out.push(textWithout(l, 300));
    const ids = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    const root = el.getRootNode();
    for (const id of ids) {
      const t = root.getElementById ? root.getElementById(id) : null;
      if (t) out.push(textWithout(t, 200));
    }
    return out.filter(Boolean);
  };

  const rowLabel = (el) => {
    const tr = el.closest('tr');
    if (tr) {
      const cells = Array.from(tr.children);
      const own = cells.find((c) => c.contains(el));
      const others = cells.filter((c) => c !== own);
      const th = others.find((c) => c.tagName === 'TH') || others.find((c) => !c.querySelector(CONTROL_SEL));
      if (th) return textWithout(th, 200);
    }
    const dd = el.closest('dd');
    if (dd) {
      let p = dd.previousElementSibling;
      while (p && p.tagName !== 'DT') p = p.previousElementSibling;
      if (p) return textWithout(p, 200);
    }
    const fs = el.closest('fieldset');
    if (fs) {
      const lg = fs.querySelector('legend');
      if (lg) return textWithout(lg, 200);
    }
    return '';
  };

  const hasControl = (n) => !!(n.matches && (n.matches(CONTROL_SEL) || n.querySelector(CONTROL_SEL)));

  const precedingLabel = (el) => {
    let node = el;
    for (let depth = 0; depth < 4 && node; depth++) {
      const prev = node.previousElementSibling;
      if (prev && !hasControl(prev)) {
        const t = textWithout(prev, 120);
        if (t && t.length <= 80) return t;
      }
      node = node.parentElement;
      if (!node || node.tagName === 'FORM' || node.tagName === 'BODY') break;
    }
    return '';
  };

  const nearText = (el) => {
    let node = el.parentElement;
    for (let depth = 0; depth < 4 && node; depth++) {
      const count = node.querySelectorAll(CONTROL_SEL).length;
      if (count > 8) break;
      const t = textWithout(node, 400);
      if (t && t.length > 0 && (depth >= 1 || t.length > 0)) {
        if (node.tagName === 'FORM' || node.tagName === 'BODY') break;
        return cut(t, 300);
      }
      node = node.parentElement;
    }
    return '';
  };

  const hintOf = (el) => {
    const out = [];
    const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    const root = el.getRootNode();
    for (const id of ids) {
      const t = root.getElementById ? root.getElementById(id) : null;
      if (t) out.push(textWithout(t, 200));
    }
    let n = el.nextElementSibling;
    for (let i = 0; i < 2 && n; i++, n = n.nextElementSibling) {
      if (hasControl(n)) break;
      const t = textWithout(n, 160);
      if (t) out.push(t);
    }
    return cut(out.join(' / '), 300);
  };

  const classTextOf = (el) => {
    const parts = [el.className && String(el.className)];
    const labels = el.labels ? Array.from(el.labels) : [];
    for (const l of labels) parts.push(l.className && String(l.className));
    const tr = el.closest('tr, .form-group, .form-item, .field, dl, li, p, div');
    if (tr && !tr.querySelector('form')) parts.push(tr.className && String(tr.className));
    const th = el.closest('tr') ? el.closest('tr').querySelector('th') : null;
    if (th) parts.push(th.className && String(th.className));
    return parts.filter(Boolean).join(' ').slice(0, 300);
  };

  const intAttr = (el, name) => {
    const v = el.getAttribute(name);
    if (v === null || v === '') return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX), width: Math.round(r.width), height: Math.round(r.height) };
  };

  const optionLabel = (el) => {
    const l = labelsOf(el);
    if (l.length) return l[0];
    const wrap = el.closest('label');
    if (wrap) return textWithout(wrap, 200);
    // 直後のテキスト
    let n = el.nextSibling;
    while (n && n.nodeType === 3 && !clean(n.nodeValue)) n = n.nextSibling;
    if (n && n.nodeType === 3) return clean(n.nodeValue);
    const ne = el.nextElementSibling;
    if (ne && !hasControl(ne)) return textWithout(ne, 100);
    return '';
  };

  // フォームごとにグルーピング
  const formKey = (el) => el.form || el.closest('form') || null;
  const groups = new Map(); // formEl|null -> items
  const radioGroups = new Map(); // `${formIdx}|${name}|${type}` -> item

  const formIds = new Map();
  const formIdOf = (f) => {
    if (!formIds.has(f)) formIds.set(f, formIds.size);
    return formIds.get(f);
  };

  for (const { el, inShadow } of controls) {
    const type = typeOf(el);
    if (SKIP_TYPES.has(type)) continue;
    if (el.disabled) continue;
    const isChoice = type === 'radio' || type === 'checkbox';
    const kind = isChoice ? 'choice' : type === 'file' ? 'file' : 'text';
    if (!isVisibleControl(el, kind)) continue;

    const key = formKey(el);
    if (!groups.has(key)) groups.set(key, []);
    const list = groups.get(key);
    const labels = labelsOf(el);
    const base = {
      tag: el.tagName.toLowerCase(),
      type,
      name: el.getAttribute('name') || '',
      id: el.getAttribute('id') || '',
      placeholder: el.getAttribute('placeholder') || '',
      required: el.required === true || el.hasAttribute('required'),
      ariaRequired: el.getAttribute('aria-required') === 'true',
      maxlength: intAttr(el, 'maxlength') ?? intAttr(el, 'data-maxlength') ?? intAttr(el, 'data-max-length'),
      minlength: intAttr(el, 'minlength'),
      pattern: el.getAttribute('pattern') || '',
      inputmode: el.getAttribute('inputmode') || '',
      autocomplete: el.getAttribute('autocomplete') || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      title: el.getAttribute('title') || '',
      label: labels.join(' / ') || rowLabel(el) || precedingLabel(el),
      hint: hintOf(el),
      nearText: nearText(el),
      groupLabel: '',
      classText: classTextOf(el),
      options: [],
      rect: rectOf(el),
      frameUrl: location.href,
      inShadow,
      disabled: false,
      readonly: el.readOnly === true || el.hasAttribute('readonly'),
      multiple: el.multiple === true,
    };

    if (type === 'select') {
      base.options = Array.from(el.options).slice(0, 400).map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: clean(o.textContent),
        disabled: o.disabled,
      }));
      list.push(base);
    } else if (isChoice) {
      const gk = `${key ? formIdOf(key) : 'x'}|${base.name || base.id || list.length}|${type}`;
      const opt = { value: el.getAttribute('value') ?? '', label: optionLabel(el), disabled: false };
      if (base.name && radioGroups.has(gk)) {
        const g = radioGroups.get(gk);
        g.options.push(opt);
        g.required = g.required || base.required;
      } else {
        base.options = [opt];
        base.groupLabel = rowLabel(el) || precedingLabel(el);
        if (base.name) radioGroups.set(gk, base);
        list.push(base);
      }
    } else {
      list.push(base);
    }
  }

  // 検索フォーム・ログインフォームの判定
  const isSearchLike = (formEl, items) => {
    if (formEl) {
      const role = (formEl.getAttribute('role') || '').toLowerCase();
      if (role === 'search') return true;
      const act = (formEl.getAttribute('action') || '').toLowerCase();
      if (/search|\/s\/?$|\?s=/.test(act)) return items.length <= 2;
    }
    if (items.length <= 2 && items.every((i) => i.type === 'search' || /^(q|s|query|keyword|search|kw)$/i.test(i.name))) return true;
    if (items.some((i) => i.type === 'password') && items.length <= 3) return true;
    return false;
  };

  const lca = (els) => {
    let a = els[0];
    while (a && !els.every((e) => a.contains(e))) a = a.parentElement;
    return a;
  };

  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  const headingsFor = (anchor) => {
    const out = [];
    const h1 = document.querySelector('h1');
    if (h1) out.push(textWithout(h1, 120));
    let last = null;
    for (const h of headings) {
      if (h.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING) last = h;
      else break;
    }
    if (last) {
      const t = textWithout(last, 120);
      if (t && !out.includes(t)) out.push(t);
    }
    return out.filter(Boolean);
  };

  const forms = [];
  let order = 0;
  for (const [formEl, items] of groups) {
    if (items.length === 0) continue;
    const anchorEls = controls.filter((c) => formKey(c.el) === formEl).map((c) => c.el);
    let container = formEl;
    if (!container) {
      container = lca(anchorEls.slice(0, 20));
      for (let i = 0; i < 3 && container && container.parentElement && textWithout(container, 3000).length < 600; i++) container = container.parentElement;
    }
    const submitLabels = [];
    if (container) {
      container.querySelectorAll('button, input[type="submit"], input[type="image"]').forEach((b) => {
        const t = b.tagName === 'INPUT' ? (b.getAttribute('value') || b.getAttribute('alt') || '') : textWithout(b, 80);
        const ty = (b.getAttribute('type') || (b.tagName === 'BUTTON' ? 'submit' : '')).toLowerCase();
        if (t && (ty === 'submit' || ty === 'image' || ty === '')) submitLabels.push(clean(t));
      });
    }
    items.forEach((it) => { it.order = order++; });
    forms.push({
      index: forms.length,
      frameUrl: location.href,
      isIframe: window.top !== window,
      formId: formEl ? formEl.getAttribute('id') || '' : '',
      formName: formEl ? formEl.getAttribute('name') || '' : '',
      formClass: formEl ? String(formEl.className || '').slice(0, 120) : '',
      hasFormTag: !!formEl,
      headings: headingsFor(container || document.body),
      text: container ? cut(textWithout(container, 6000), 5000) : '',
      submitLabels: Array.from(new Set(submitLabels)).slice(0, 6),
      fields: items,
      isSearchLike: isSearchLike(formEl, items),
    });
  }

  // CAPTCHA の有無（存在の検出のみ。操作はしない）
  const kinds = [];
  const q = (s) => !!document.querySelector(s);
  if (q('.g-recaptcha, iframe[src*="recaptcha"], textarea[name="g-recaptcha-response"], [data-sitekey]:not(.h-captcha):not(.cf-turnstile)')) kinds.push('reCAPTCHA');
  else if (q('script[src*="recaptcha"]')) kinds.push('reCAPTCHA（不可視の可能性）');
  if (q('.h-captcha, iframe[src*="hcaptcha"]')) kinds.push('hCaptcha');
  if (q('.cf-turnstile, iframe[src*="challenges.cloudflare.com"]')) kinds.push('Cloudflare Turnstile');
  if (q('img[src*="captcha" i], input[name*="captcha" i], [id*="captcha" i]:not(script):not(iframe)')) kinds.push('画像/文字認証など');

  return {
    url: location.href,
    title: document.title || '',
    forms,
    captcha: { present: kinds.length > 0, kinds: Array.from(new Set(kinds)) },
    pageText: document.body ? clean(document.body.innerText || '').slice(0, 30000) : '',
  };
})()
