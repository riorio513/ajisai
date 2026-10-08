/** ブラウザから読み取った生のフォーム構造を、意味付きの FormAnalysis に変換する（純粋関数） */
import type { FormAnalysis, FormField, RawField, RawFormInfo, RawPageForms } from '../shared/types';
import { classifyField, controlKindOf, groupSplitFields } from '../field-mapper/rules';
import { parseConditions, textLimitFrom } from './conditions';
import { norm, stripMarkers } from './text';

/** 画面に出すラベル（元の大文字小文字を保ち、必須マーク等を除く） */
export function displayLabelOf(f: RawField): string {
  const pick = [f.label, f.groupLabel, f.ariaLabel, f.title, f.placeholder, f.nearText.slice(0, 40), f.name].find((x) => x && x.trim()) ?? '(ラベルなし)';
  const cleaned = pick
    .replace(/[（(【\[]\s*(必須|任意)\s*[）)】\]]/g, ' ')
    .replace(/(必須|任意)/g, ' ')
    .replace(/[※*＊●★]/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || pick).slice(0, 48);
}

function formScore(form: RawFormInfo): number {
  if (form.isSearchLike) return -100;
  const fields = form.fields;
  const textLike = fields.filter((f) => ['text', 'email', 'tel', 'url', 'number', 'textarea', 'contenteditable', 'select'].includes(f.type) || f.tag === 'textarea' || f.tag === 'select').length;
  const hasTextarea = fields.some((f) => f.tag === 'textarea' || f.type === 'contenteditable');
  const hasEmail = fields.some((f) => f.type === 'email' || /mail/i.test(f.name + f.id + f.label));
  let score = textLike;
  if (hasTextarea) score += 4;
  if (hasEmail) score += 2;
  if (form.isIframe) score += 0.5;
  if (fields.length < 2) score -= 5;
  return score;
}

function buildFields(form: RawFormInfo): FormField[] {
  const sorted = [...form.fields].sort((a, b) => a.order - b.order);
  const base = sorted.map((f) => classifyField(f));
  const grouped = groupSplitFields(sorted, base);
  return sorted.map((raw, i) => ({
    raw,
    control: controlKindOf(raw),
    std: grouped[i].cls.std,
    stdReason: grouped[i].cls.reason,
    stdBy: grouped[i].cls.std === 'unknown' ? 'none' : 'rule',
    stdConfidence: grouped[i].cls.confidence,
    splitIssue: grouped[i].splitIssue,
    conditions: parseConditions(raw),
    displayLabel: displayLabelOf(raw),
  }));
}

function limitFor(fields: FormField[], std: 'body' | 'subject'): { limit: number | null; source: string } {
  const f = fields.find((x) => x.std === std);
  if (!f) return { limit: null, source: '該当する入力欄なし' };
  const attr = f.raw.maxlength;
  const text = textLimitFrom([f.raw.hint, f.raw.nearText, f.raw.label].join(' '));
  if (attr !== null && text !== null && attr !== text) {
    return { limit: Math.min(attr, text), source: `maxlength属性(${attr})と注意書き(${text})のうち小さい方` };
  }
  if (attr !== null) return { limit: attr, source: 'maxlength属性' };
  if (text !== null) return { limit: text, source: '注意書き・文字数表示' };
  return { limit: null, source: '上限の記載なし' };
}

export interface AnalyzeOptions {
  /** 複数候補から手動で選んだフォーム番号 */
  formIndex?: number;
  now?: () => Date;
}

/** 最も問い合わせフォームらしいフォームを選んで解析する。無ければ null */
export function analyzeForms(raw: RawPageForms, opts: AnalyzeOptions = {}): FormAnalysis | null {
  const scored = raw.forms.map((f) => ({ f, score: formScore(f) })).filter((x) => x.score > 0);
  if (scored.length === 0) return null;
  const chosen = opts.formIndex !== undefined ? scored.find((x) => x.f.index === opts.formIndex) ?? scored[0] : [...scored].sort((a, b) => b.score - a.score)[0];
  const fields = buildFields(chosen.f);
  return {
    url: raw.url,
    title: raw.title,
    frameUrl: chosen.f.frameUrl,
    isIframe: chosen.f.isIframe,
    formIndex: chosen.f.index,
    headings: chosen.f.headings,
    fields,
    captcha: raw.captcha,
    submitLabels: chosen.f.submitLabels,
    bodyLimit: limitFor(fields, 'body'),
    subjectLimit: limitFor(fields, 'subject'),
    otherCandidates: scored.filter((x) => x.f.index !== chosen.f.index).map((x) => ({ index: x.f.index, fieldCount: x.f.fields.length, frameUrl: x.f.frameUrl })),
    noticeText: chosen.f.text,
    analyzedAt: (opts.now?.() ?? new Date()).toISOString(),
  };
}

/** フォームが「問い合わせフォームらしい」か（探索中の判定用） */
export function looksLikeContactForm(raw: RawPageForms): boolean {
  return raw.forms.some((f) => formScore(f) >= 6);
}

export { norm, stripMarkers };
