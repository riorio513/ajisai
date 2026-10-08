// 読み取り専用スクリプト: ページのタイトル・見出し・本文テキスト・リンク一覧を取得する。
(() => {
  const clean = (s) => (s || '').replace(/[ \t 　]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  const body = document.body;
  const text = body ? clean(body.innerText || '') : '';
  const area = (a) => {
    if (a.closest('footer, [role="contentinfo"]')) return 'footer';
    if (a.closest('header, [role="banner"]')) return 'header';
    if (a.closest('nav, [role="navigation"]')) return 'nav';
    return 'main';
  };
  const links = [];
  const seen = new Set();
  document.querySelectorAll('a[href], area[href]').forEach((a) => {
    const href = a.href;
    if (!href || /^(javascript:|#)/i.test(a.getAttribute('href') || '')) return;
    const label = clean(a.innerText || a.getAttribute('aria-label') || a.getAttribute('title') || (a.querySelector('img') ? a.querySelector('img').alt : '') || '');
    const key = href + '|' + label;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ href, text: label.slice(0, 120), area: area(a), title: (a.getAttribute('title') || '').slice(0, 80) });
  });
  const h = (sel) => Array.from(document.querySelectorAll(sel)).map((e) => clean(e.innerText || '')).filter(Boolean).slice(0, 20);
  return {
    url: location.href,
    title: document.title || '',
    lang: document.documentElement.getAttribute('lang') || '',
    h1: h('h1'),
    headings: h('h2, h3').slice(0, 40),
    text: text.slice(0, 60000),
    links: links.slice(0, 800),
    iframes: Array.from(document.querySelectorAll('iframe[src]')).map((f) => f.src).slice(0, 20),
    hasFormTag: !!document.querySelector('form'),
    metaDescription: (document.querySelector('meta[name="description"]') || {}).content || '',
    mailtos: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map((a) => a.getAttribute('href')).slice(0, 5),
  };
})()
