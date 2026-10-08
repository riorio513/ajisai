import { digitsOf } from './phone';

export interface PostalForms {
  plain: string;
  hyphen: string;
  parts: [string, string];
}

/** 7桁の郵便番号のみ対応。桁数が違えば null（呼び出し側で要確認） */
export function formatPostal(raw: string): PostalForms | null {
  const d = digitsOf(raw);
  if (d.length !== 7) return null;
  return { plain: d, hyphen: `${d.slice(0, 3)}-${d.slice(3)}`, parts: [d.slice(0, 3), d.slice(3)] };
}
