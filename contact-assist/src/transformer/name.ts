/** 氏名の機械的な結合・分割 */

const SEP = /[ 　]+/;

/** 「姓 名」のように区切りが1箇所だけの場合のみ分割できる。曖昧なら null */
export function splitFullName(full: string): { last: string; first: string } | null {
  const t = full.replace(/^[ 　]+|[ 　]+$/g, '');
  const tokens = t.split(SEP).filter(Boolean);
  if (tokens.length !== 2) return null;
  return { last: tokens[0], first: tokens[1] };
}

export type NameJoin = 'space' | 'fullwidth-space' | 'none';

export function joinName(last: string, first: string, style: NameJoin): string {
  if (style === 'none') return last + first;
  return last + (style === 'space' ? ' ' : '　') + first;
}
