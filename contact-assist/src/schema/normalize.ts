/** 見出し・ラベル比較用の正規化。表示や入力値には使わない */
export function normalizeHeader(s: string): string {
  let t = s.normalize('NFKC').toLowerCase();
  t = t.replace(/[\s　]+/g, '');
  t = t.replace(/[・:：()（）【】\[\]「」『』*＊※★☆〇○◎◯_\-‐‑–—―./／、,，<>＜＞]/g, '');
  t = t.replace(/(必須|任意)$/g, '');
  return t;
}

export function isBlank(s: string | undefined): boolean {
  return !s || s.replace(/[\s　]+/g, '') === '';
}

/** 列番号 → Excelの列名 (0 → A) */
export function colName(c: number): string {
  let n = c;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function cellAddress(r: number, c: number): string {
  return `${colName(c)}${r + 1}`;
}

/** 簡易ハッシュ（キャッシュキー・指紋用。暗号用途ではない） */
export function hashString(s: string): string {
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
