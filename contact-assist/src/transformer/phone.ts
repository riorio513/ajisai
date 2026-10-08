/**
 * 電話番号の整形。
 * 区切り位置は「Excelに明示された区切り」または「確実な番号体系」からのみ確定する。
 * 確定できなければ null を返し、呼び出し側が「電話番号分割要確認」にする。
 */
import { toHalfWidthAscii } from './text';

export function digitsOf(s: string): string {
  return toHalfWidthAscii(s.normalize('NFKC')).replace(/\D/g, '');
}

/** 区切り文字（各種ハイフン・空白・括弧）で数字グループに分ける */
function groupsOf(s: string): string[] {
  const t = s.normalize('NFKC');
  return t.split(/[^0-9]+/).filter((g) => g.length > 0);
}

export interface PhoneParts {
  parts: string[];
  basis: 'explicit' | 'rule';
}

/** 3桁/4桁などの先頭が確実に決まる番号体系 */
function splitByRule(d: string): string[] | null {
  if (!/^0\d{9,10}$/.test(d)) return null;
  if (d.length === 11 && /^(070|080|090|050)/.test(d)) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
  if (d.length === 10 && /^0120/.test(d)) return [d.slice(0, 4), d.slice(4, 7), d.slice(7)];
  if (d.length === 10 && /^0570/.test(d)) return [d.slice(0, 4), d.slice(4, 7), d.slice(7)];
  if (d.length === 11 && /^0800/.test(d)) return [d.slice(0, 4), d.slice(4, 7), d.slice(7)];
  if (d.length === 10 && /^0[36]/.test(d)) return [d.slice(0, 2), d.slice(2, 6), d.slice(6)];
  if (d.length === 10 && /^(011|022|045|052|075|078|082|092)/.test(d)) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  return null;
}

/**
 * @param digits 数字のみの電話番号
 * @param variants Excel上の表記（ハイフン付きがあれば区切り位置の根拠になる）
 */
export function splitPhone(digits: string, variants: string[] = []): PhoneParts | null {
  const explicit: string[][] = [];
  for (const v of variants) {
    const g = groupsOf(v);
    if (g.length === 3 && g.join('') === digits) explicit.push(g);
  }
  if (explicit.length > 0) {
    const first = explicit[0].join('-');
    if (explicit.every((e) => e.join('-') === first)) return { parts: explicit[0], basis: 'explicit' };
    return null; // 表記ごとに区切りが食い違う → 確定しない
  }
  const r = splitByRule(digits);
  return r ? { parts: r, basis: 'rule' } : null;
}

/** 数字が電話番号として妥当な桁数か（日本の番号: 10〜11桁） */
export function isPlausiblePhone(digits: string): boolean {
  return /^0\d{9,10}$/.test(digits);
}
