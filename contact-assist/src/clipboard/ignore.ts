/**
 * 作業に関係ない入力項目の「無視」ルール。
 * 無視した項目は、エラー（フォーム解析要確認など）にせず、薄く表示するだけにする。値も用意しない。
 *
 *  - 標準で無視するもの: 意味が分からず（unknown）、かつ下記に当てはまる項目
 *  - 利用者が「この項目は無視する」で追加したキーワード: 項目名に含まれていれば、どの項目でも無視する
 */
import type { FormField } from '../shared/types';
import { normalizeKey } from '../transformer';

const DEFAULT_TEXT_IGNORE: RegExp[] = [/職種/];
/** 「内容を確認したらチェックを入れてください」のような、送信前の確認チェック */
const DEFAULT_CONFIRM_CHECK = /(確認(し|を|後|いただ|のうえ|の上|できました)|チェック(を)?(入れ|して|ください))/;

export const DEFAULT_IGNORE_NOTE = '作業に関係ない項目として無視しています（必要なら人間が操作します）';

function textOf(f: FormField): string {
  return [f.displayLabel, f.raw.label, f.raw.groupLabel, f.raw.ariaLabel, f.raw.title, f.raw.name].join(' ');
}

export function isIgnored(f: FormField, userKeywords: string[] = []): boolean {
  const t = textOf(f);
  const nt = normalizeKey(t);
  if (userKeywords.some((k) => k.trim() && nt.includes(normalizeKey(k)))) return true;
  // ルールで確かに分類できた項目は対象外。意味が分からない項目と、AIが推測しただけの項目だけを標準ルールで無視する
  if (f.std !== 'unknown' && f.stdBy !== 'ai') return false;
  if (f.control === 'checkbox' && DEFAULT_CONFIRM_CHECK.test(t.normalize('NFKC'))) return true;
  return DEFAULT_TEXT_IGNORE.some((re) => re.test(t.normalize('NFKC')));
}
