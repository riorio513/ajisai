/** 文字数計算。ブラウザの maxlength と同じ UTF-16 コードユニット数で数える */
export function countChars(s: string): number {
  return s.length;
}

/** 送信時に改行をCRLF(2文字)で数えるサーバー向けの参考値 */
export function countCharsCrlf(s: string): number {
  return s.replace(/\r?\n/g, '\r\n').length;
}
