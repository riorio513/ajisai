/** フォーム解析用の文字列ユーティリティ */

export function norm(s: string): string {
  return (s ?? '').normalize('NFKC').toLowerCase().replace(/[\s　]+/g, ' ').trim();
}

/** 必須/任意などの目印を取り除いた、ラベル本体 */
export function stripMarkers(s: string): string {
  return norm(s)
    .replace(/[（(【\[]\s*(必須|任意|required|optional)\s*[）)】\]]/g, ' ')
    .replace(/(必須|任意|required|optional)/g, ' ')
    .replace(/[※*＊●★■◆▼▲]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** name/id の区切りを _ にそろえ、camelCase も分解する */
export function nameTokens(name: string, id: string): string {
  const raw = `${name} ${id}`.trim();
  const camel = raw.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
  return '_' + camel.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_';
}
