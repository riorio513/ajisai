/**
 * 入力支援パネルの中身を作る。
 * フォームの各入力欄（表示順のまま）について、問い合わせ情報マスターから「そのまま貼り付けられる文字列」を
 * 機械的な変換だけで生成する。元データに無い情報は作らない。
 */
import type {
  ControlKind, FieldConditions, FormAnalysis, FormField, InputPlan, MasterData, PlanCandidate, PlanItem, PlanError,
  StatusCode, StdField, Template,
} from '../shared/types';
import { STATUS, STD_LABEL } from '../shared/types';
import {
  convertKana, countChars, countCharsCrlf, digitsOf, formatPostal, isPlausiblePhone, joinName, normalizeKey, splitFullName,
  splitPhone, toFullWidthAscii, toHalfWidthAscii,
} from '../transformer';
import { composeBody } from '../templates/compose';
import { isAddrField, resolveAddress } from './address';

export interface PlanInput {
  analysis: FormAnalysis;
  master: MasterData;
  /** Excelの企業名（本文の先頭に入る対象企業名） */
  companyName: string;
  template: Template | null;
}

// ───────── 補助 ─────────

function applyWidth(value: string, cond: FieldConditions): string {
  if (cond.width === 'full') return toFullWidthAscii(value);
  if (cond.width === 'half') return toHalfWidthAscii(value);
  return value;
}

function chipsOf(f: FormField): string[] {
  const c = f.conditions;
  const chips: string[] = [];
  if (c.width === 'half') chips.push('半角');
  if (c.width === 'full') chips.push('全角');
  if (c.charset === 'digits') chips.push('数字のみ');
  if (c.charset === 'alnum') chips.push('英数字');
  if (c.kanaScript === 'katakana') chips.push('カタカナ');
  if (c.kanaScript === 'hiragana') chips.push('ひらがな');
  if (c.hyphen === 'with') chips.push('ハイフンあり');
  if (c.hyphen === 'without') chips.push('ハイフンなし');
  if (c.space === 'without') chips.push('スペースなし');
  if (c.space === 'with') chips.push('スペースあり');
  if (c.maxLength !== null) chips.push(`最大${c.maxLength}文字`);
  if (c.minLength !== null) chips.push(`最小${c.minLength}文字`);
  const s = f.std;
  if ((s === 'phone' || s === 'postal') && c.hyphen === 'unknown') chips.push('ハイフン: 不明');
  if ((s === 'kana' || s === 'lastKana' || s === 'firstKana' || s === 'companyKana') && c.kanaScript === 'unknown') chips.push('かな種別: 不明');
  return chips;
}

function skeleton(f: FormField, idx: number): PlanItem {
  return {
    id: `f${f.raw.order}`,
    order: idx,
    label: f.displayLabel,
    std: f.std,
    stdLabel: STD_LABEL[f.std],
    stdReason: f.stdReason,
    required: f.conditions.required,
    control: f.control,
    conditionChips: chipsOf(f),
    status: 'ok',
    warnings: [],
    lowConfidence: f.stdConfidence === 'low' || undefined,
  };
}

function matchesPattern(pattern: string, value: string): boolean | null {
  if (!pattern) return null;
  try {
    return new RegExp(`^(?:${pattern})$`).test(value);
  } catch {
    return null;
  }
}

function cand(id: string, label: string, value: string, recommended = false): PlanCandidate {
  return { id, label, value, recommended };
}

// ───────── 数字系（電話・郵便）─────────

function numberItem(item: PlanItem, f: FormField, digitsForms: { plain: string; hyphen: string | null }): void {
  const c = f.conditions;
  let options: { id: 'plain' | 'hyphen'; label: string; value: string }[] = [{ id: 'plain', label: 'ハイフンなし', value: digitsForms.plain }];
  if (digitsForms.hyphen) options.push({ id: 'hyphen', label: 'ハイフンあり', value: digitsForms.hyphen });
  const why: string[] = [];

  if (f.raw.type === 'number') {
    options = options.filter((o) => o.id === 'plain');
    why.push('type=number');
  } else if (c.hyphen === 'without') {
    options = options.filter((o) => o.id === 'plain');
    why.push('「ハイフンなし」の指示');
  } else if (c.hyphen === 'with') {
    if (!digitsForms.hyphen) {
      item.status = 'need-confirm';
      item.issue = item.std === 'phone' ? STATUS.PHONE_SPLIT : STATUS.OTHER;
      item.note = item.std === 'phone' ? 'ハイフンありの指定ですが、区切り位置を確定できません。番号は ' + digitsForms.plain : '郵便番号が7桁ではありません';
      item.candidates = [cand('plain', '区切りなし（参考）', digitsForms.plain)];
      return;
    }
    options = options.filter((o) => o.id === 'hyphen');
    why.push('「ハイフンあり」の指示');
  } else {
    const byPattern = options.filter((o) => matchesPattern(f.raw.pattern, o.value) === true);
    if (f.raw.pattern && byPattern.length > 0 && byPattern.length < options.length) {
      options = byPattern;
      why.push('pattern属性');
    }
    const max = c.maxLength;
    if (max !== null) {
      const byLen = options.filter((o) => o.value.length <= max);
      if (byLen.length > 0 && byLen.length < options.length) {
        options = byLen;
        why.push(`maxlength=${max}`);
      }
    }
  }
  const finalize = (v: string) => applyWidth(v, c);
  if (options.length === 1) {
    item.status = 'ok';
    item.value = finalize(options[0].value);
    if (why.length) item.note = `形式の根拠: ${why.join(', ')}`;
    if (item.std === 'phone' && !digitsForms.hyphen && options[0].id === 'plain' && c.hyphen !== 'without') {
      item.warnings.push('区切り位置を確定できないため、ハイフンなしのみ表示しています');
    }
    return;
  }
  item.status = 'candidates';
  item.candidates = options.map((o) => cand(o.id, o.label, finalize(o.value), false));
  item.note = '形式を確定できません（要確認）。入力欄の表示・エラーを見て選んでください';
}

// ───────── 名前系 ─────────

interface NameSrc {
  full?: string;
  last?: string;
  first?: string;
}

function nameSrc(master: MasterData, kana: boolean): NameSrc {
  const v = master.values;
  const s: NameSrc = kana ? { full: v.fullKana, last: v.lastKana, first: v.firstKana } : { full: v.fullName, last: v.lastName, first: v.firstName };
  if ((!s.last || !s.first) && s.full) {
    const sp = splitFullName(s.full);
    if (sp) {
      s.last = s.last ?? sp.last;
      s.first = s.first ?? sp.first;
    }
  }
  return s;
}

function sepCandidates(c: FieldConditions, last: string, first: string): PlanCandidate[] {
  const out: PlanCandidate[] = [];
  const fw = joinName(last, first, 'fullwidth-space');
  const hw = joinName(last, first, 'space');
  const none = joinName(last, first, 'none');
  if (c.space === 'without') return [cand('none', 'スペースなし', none)];
  if (c.space === 'with') {
    if (c.width === 'full') return [cand('fw', '全角スペース区切り', fw)];
    if (c.width === 'half') return [cand('hw', '半角スペース区切り', hw)];
    out.push(cand('fw', '全角スペース区切り', fw), cand('hw', '半角スペース区切り', hw));
    return out;
  }
  out.push(cand('fw', '全角スペース区切り', fw), cand('hw', '半角スペース区切り', hw), cand('none', 'スペースなし', none));
  return out;
}

function adjustFullSeparator(full: string, c: FieldConditions): string {
  if (c.space === 'without') return full.replace(/[ 　]+/g, '');
  if (c.space === 'with' && c.width === 'full') return full.replace(/ +/g, '　');
  if (c.space === 'with' && c.width === 'half') return full.replace(/　+/g, ' ');
  return full;
}

function kanaValue(raw: string, c: FieldConditions): { value?: string; candidates?: PlanCandidate[]; bad?: boolean } {
  const half = c.width === 'half';
  if (c.kanaScript === 'unknown') {
    const k = convertKana(raw, 'katakana', half);
    const h = convertKana(raw, 'hiragana');
    if (k === null || h === null) return { bad: true };
    return { candidates: [cand('kata', 'カタカナ', k), cand('hira', 'ひらがな', h)] };
  }
  const v = convertKana(raw, c.kanaScript, half);
  return v === null ? { bad: true } : { value: v };
}

// ───────── 選択系 ─────────

const PLACEHOLDER_OPTION = /^(選択|選んで|選択してください|選択して下さい|--+|ー+|―+|未選択|お選びください|please select|select)/i;

function realOptions(f: FormField): string[] {
  return f.raw.options.filter((o) => !o.disabled && o.label && !(o.value === '' && PLACEHOLDER_OPTION.test(o.label.trim())) && !PLACEHOLDER_OPTION.test(o.label.trim())).map((o) => o.label);
}

function pickOption(options: string[], desired: string): string | undefined {
  const d = normalizeKey(desired);
  const alt = d.replace(/[都道府県]$/, '');
  return options.find((o) => normalizeKey(o) === d) ?? options.find((o) => normalizeKey(o) === alt);
}

// ───────── 本体 ─────────

export function buildPlan(input: PlanInput): InputPlan {
  const { analysis, master, companyName, template } = input;
  const v = master.values;
  const items: PlanItem[] = [];
  const errors: PlanError[] = [];
  const warnings: string[] = [];
  const present = new Set<StdField>(analysis.fields.map((f) => f.std));
  const addr = resolveAddress(master, present);

  const raiseMissing = (item: PlanItem) => {
    item.status = 'missing';
    item.note = `項目なし：${item.stdLabel}`;
    if (item.required === true) {
      errors.push({ code: STATUS.DATA_MISSING, message: `必須項目「${item.label}」に対応するデータがExcelにありません（${item.stdLabel}）` });
      item.issue = STATUS.DATA_MISSING;
    }
  };

  const setText = (item: PlanItem, f: FormField, raw: string | undefined) => {
    if (raw === undefined) return raiseMissing(item);
    item.status = 'ok';
    item.value = applyWidth(raw, f.conditions);
    const max = f.conditions.maxLength;
    if (max !== null && item.value.length > max) item.warnings.push(`文字数が上限(${max})を超えています（${item.value.length}文字）`);
  };

  const issueFor = (item: PlanItem, code: StatusCode, message: string) => {
    item.status = 'need-confirm';
    item.issue = code;
    item.note = message;
    errors.push({ code, message: `「${item.label}」: ${message}` });
  };

  analysis.fields.forEach((f, idx) => {
    const item = skeleton(f, idx);
    items.push(item);
    const std = f.std;

    // 選択・添付など、コピー＆ペーストできない欄
    if (f.control === 'file') {
      item.status = 'info';
      item.note = 'ファイル添付欄です。必要な場合は人間が選択してください';
      return;
    }
    if (f.control === 'select' || f.control === 'radio' || f.control === 'checkbox') {
      const options = realOptions(f);
      let desired: string | undefined;
      let reason = '';
      if (std === 'prefecture') {
        const r = addr.prefecture;
        desired = r?.value;
        reason = '住所から';
        if (!desired) item.issue = r?.issue === 'split' ? STATUS.ADDRESS_SPLIT : undefined;
      } else if (std === 'inquiryType') {
        if (v.inquiryType) {
          desired = pickOption(options, v.inquiryType) ? v.inquiryType : undefined;
          reason = 'Excelの問い合わせ種別';
        }
        if (!desired) {
          const others = options.filter((o) => /その他|other|上記以外|いずれにも|該当なし/i.test(o));
          if (others.length === 1) {
            desired = others[0];
            reason = '特定の分類に当てはまらない場合の汎用項目';
          }
        }
      } else if (std === 'consent') {
        item.status = 'choose';
        item.choice = { action: '同意欄にチェック（内容を確認して、人間が判断してください）', options };
        return;
      }
      item.status = 'choose';
      const matched = desired ? pickOption(options, desired) : undefined;
      if (matched) {
        item.choice = { action: `「${matched}」を選択`, options, matched };
        item.note = reason ? `根拠: ${reason}` : undefined;
      } else {
        item.choice = { action: '選択要確認', options };
        if (item.required === true && std !== 'unknown') item.note = '適切な選択肢を決められません';
        if (std === 'prefecture' && item.issue === STATUS.ADDRESS_SPLIT) {
          errors.push({ code: STATUS.ADDRESS_SPLIT, message: `「${item.label}」: 住所から都道府県を特定できません` });
        }
      }
      if (std === 'unknown' && item.required === true) {
        errors.push({ code: STATUS.FORM_UNCLEAR, message: `必須の選択項目「${item.label}」の意味を判断できません` });
      }
      return;
    }

    // テキスト入力・テキストエリア
    switch (std) {
      case 'company':
        setText(item, f, v.companyName);
        break;
      case 'companyKana': {
        if (v.companyKana === undefined) return raiseMissing(item);
        const k = kanaValue(v.companyKana, f.conditions);
        if (k.bad) return issueFor(item, STATUS.OTHER, '会社名カナの元データがかなではないため変換できません');
        if (k.value !== undefined) {
          item.status = 'ok';
          item.value = k.value;
        } else {
          item.status = 'candidates';
          item.candidates = k.candidates;
          item.note = 'かな種別が不明です（要確認）';
        }
        break;
      }
      case 'department':
        setText(item, f, v.department);
        break;
      case 'position':
        setText(item, f, v.position);
        break;
      case 'name':
      case 'kana': {
        const kana = std === 'kana';
        const s = nameSrc(master, kana);
        const finish = (raw: string, cands?: PlanCandidate[]) => {
          if (!kana) {
            if (cands) {
              item.status = 'candidates';
              item.candidates = cands.map((x) => ({ ...x, value: applyWidth(x.value, f.conditions) }));
              item.note = '区切り方が不明です（要確認）';
            } else {
              item.status = 'ok';
              item.value = applyWidth(raw, f.conditions);
            }
            return;
          }
          // かな: 区切り→文字種変換の順
          const targets = cands ?? [cand('one', '', raw)];
          const converted: PlanCandidate[] = [];
          for (const t of targets) {
            const k = kanaValue(t.value, f.conditions);
            if (k.bad) return issueFor(item, STATUS.OTHER, 'フリガナの元データがかなではないため変換できません');
            if (k.value !== undefined) converted.push({ ...t, value: k.value, label: t.label });
            else for (const kc of k.candidates ?? []) converted.push({ ...kc, id: `${t.id}-${kc.id}`, label: [t.label, kc.label].filter(Boolean).join(' / ') });
          }
          if (converted.length === 1) {
            item.status = 'ok';
            item.value = converted[0].value;
          } else {
            item.status = 'candidates';
            item.candidates = converted;
            item.note = '形式が不明です（要確認）';
          }
        };
        if (s.full !== undefined) {
          finish(adjustFullSeparator(s.full, f.conditions));
        } else if (s.last !== undefined && s.first !== undefined) {
          const cs = sepCandidates(f.conditions, s.last, s.first);
          cs.length === 1 ? finish(cs[0].value) : finish('', cs);
        } else {
          raiseMissing(item);
        }
        break;
      }
      case 'lastName':
      case 'firstName':
      case 'lastKana':
      case 'firstKana': {
        const kana = std === 'lastKana' || std === 'firstKana';
        const s = nameSrc(master, kana);
        const raw = std === 'lastName' || std === 'lastKana' ? s.last : s.first;
        if (raw === undefined) {
          const any = s.full ?? s.last ?? s.first;
          if (any !== undefined) return issueFor(item, STATUS.NAME_SPLIT, '氏名の姓と名の境目を確定できません（Excelに姓・名の欄、または姓名の間の空白が必要です）');
          return raiseMissing(item);
        }
        if (!kana) {
          setText(item, f, raw);
          break;
        }
        const k = kanaValue(raw, f.conditions);
        if (k.bad) return issueFor(item, STATUS.OTHER, 'フリガナの元データがかなではないため変換できません');
        if (k.value !== undefined) {
          item.status = 'ok';
          item.value = k.value;
        } else {
          item.status = 'candidates';
          item.candidates = k.candidates;
          item.note = 'かな種別が不明です（要確認）';
        }
        break;
      }
      case 'email':
      case 'emailConfirm':
        // メールは原文のまま（大文字小文字・全角半角を変えない）
        if (v.email === undefined) return raiseMissing(item);
        item.status = 'ok';
        item.value = v.email;
        break;
      case 'phone':
      case 'phone1':
      case 'phone2':
      case 'phone3': {
        const explicit = v.phone1 !== undefined && v.phone2 !== undefined && v.phone3 !== undefined;
        const digits = v.phone !== undefined ? digitsOf(v.phone) : explicit ? digitsOf(v.phone1! + v.phone2! + v.phone3!) : undefined;
        if (digits === undefined) return raiseMissing(item);
        if (std === 'phone') {
          if (!isPlausiblePhone(digits)) {
            item.status = 'need-confirm';
            item.note = '電話番号として標準的な形式(10〜11桁)ではないため、元データのまま表示します';
            item.candidates = [cand('raw', '元データのまま', v.phone ?? digits)];
            break;
          }
          const parts = explicit ? [v.phone1!, v.phone2!, v.phone3!] : splitPhone(digits, master.variants.phone ?? [])?.parts ?? null;
          numberItem(item, f, { plain: digits, hyphen: parts ? parts.join('-') : null });
        } else {
          const parts = explicit ? [v.phone1!, v.phone2!, v.phone3!] : splitPhone(digits, master.variants.phone ?? [])?.parts ?? null;
          if (!parts) return issueFor(item, STATUS.PHONE_SPLIT, '電話番号の区切り位置を確定できません（Excelにハイフン付きの電話番号、または3分割した値が必要です）');
          item.status = 'ok';
          item.value = applyWidth(parts[Number(std.slice(-1)) - 1], f.conditions);
        }
        break;
      }
      case 'postal':
      case 'postal1':
      case 'postal2': {
        const explicit = v.postal1 !== undefined && v.postal2 !== undefined;
        const src = v.postal ?? (explicit ? v.postal1! + v.postal2! : undefined);
        if (src === undefined) return raiseMissing(item);
        const pf = formatPostal(src);
        if (!pf) return issueFor(item, STATUS.OTHER, `郵便番号が7桁ではありません（${src}）`);
        if (std === 'postal') numberItem(item, f, { plain: pf.plain, hyphen: pf.hyphen });
        else {
          item.status = 'ok';
          const parts: string[] = explicit && !v.postal ? [v.postal1!, v.postal2!] : pf.parts;
          item.value = applyWidth(parts[std === 'postal1' ? 0 : 1], f.conditions);
        }
        break;
      }
      case 'prefecture':
      case 'city':
      case 'town':
      case 'street':
      case 'building':
      case 'address': {
        if (!isAddrField(std)) break;
        const r = addr[std];
        if (!r || r.issue === 'missing') return raiseMissing(item);
        if (r.issue === 'split') return issueFor(item, STATUS.ADDRESS_SPLIT, r.note ?? '住所の境界を確定できません');
        setText(item, f, r.value);
        break;
      }
      case 'url':
        setText(item, f, v.url);
        break;
      case 'inquiryType':
        // テキスト欄の問い合わせ種別: Excelに指定がある場合のみ
        setText(item, f, v.inquiryType);
        break;
      case 'subject': {
        if (!template || template.subject === '') return raiseMissing(item);
        item.status = 'ok';
        item.value = template.subject; // Excel原文そのまま（加工しない）
        break;
      }
      case 'body': {
        if (!template) return raiseMissing(item);
        item.status = 'ok';
        item.value = composeBody(companyName, template.body);
        break;
      }
      case 'fax':
        item.status = 'missing';
        item.note = '項目なし：FAX（Excelに該当データがありません）';
        break;
      case 'consent':
        item.status = 'choose';
        item.choice = { action: '同意欄にチェック（内容を確認して、人間が判断してください）', options: [] };
        break;
      default:
        item.status = 'unknown-field';
        item.note = '不明な入力項目（このアプリでは値を用意しません。人間が確認してください）';
        if (item.required === true) {
          errors.push({ code: STATUS.FORM_UNCLEAR, message: `必須の入力項目「${item.label}」の意味を判断できません` });
          item.issue = STATUS.FORM_UNCLEAR;
        }
    }

    // 件名・本文の文字数
    if ((std === 'subject' || std === 'body') && item.value !== undefined) {
      const lim = std === 'body' ? analysis.bodyLimit : analysis.subjectLimit;
      const limit = lim.limit ?? f.conditions.maxLength;
      const count = countChars(item.value);
      const countCrlf = countCharsCrlf(item.value);
      const ok = limit === null || count <= limit;
      const crlfWarning = limit !== null && ok && countCrlf > limit;
      item.charCheck = { count, countCrlf, limit, limitSource: lim.limit !== null ? lim.source : limit !== null ? 'maxlength属性' : '上限の記載なし', ok, crlfWarning };
      if (!ok) {
        errors.push({ code: STATUS.CHAR_LIMIT, message: `${std === 'body' ? '本文' : '件名'}が${count}文字で、上限${limit}文字を超えています（短縮・要約はしません）` });
        item.issue = STATUS.CHAR_LIMIT;
      } else if (crlfWarning) {
        item.warnings.push(`改行を2文字（CRLF）で数えるサーバーでは${countCrlf}文字となり、上限${limit}を超える可能性があります`);
      }
    }
  });

  if (analysis.otherCandidates.length > 0) warnings.push(`このページには他にも入力フォームらしきものが${analysis.otherCandidates.length}件あります（別のフォームを選び直せます）`);
  if (items.some((i) => i.lowConfidence)) warnings.push('一部の項目は手がかりが少なく、分類を「要確認」としています');

  return { items, errors, warnings, captcha: analysis.captcha, submitLabels: analysis.submitLabels };
}

export type { ControlKind };
