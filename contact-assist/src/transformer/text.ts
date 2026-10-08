/**
 * 文字種の機械的変換。意味を変えない変換だけを提供する。
 * （要約・言い換え・補完などは一切しない）
 */

/** 比較用キー: NFKC + 小文字化 + 空白除去。表示・入力には使わない */
export function normalizeKey(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[\s　]+/g, '');
}

/** 全角ASCII(！〜～)と全角スペースを半角へ。日本語文字には触れない */
export function toHalfWidthAscii(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0xff01 && c <= 0xff5e) out += String.fromCodePoint(c - 0xfee0);
    else if (c === 0x3000) out += ' ';
    else out += ch;
  }
  return out;
}

/** 半角ASCII(!〜~)と半角スペースを全角へ。日本語文字には触れない */
export function toFullWidthAscii(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x21 && c <= 0x7e) out += String.fromCodePoint(c + 0xfee0);
    else if (c === 0x20) out += '　';
    else out += ch;
  }
  return out;
}

const HALF_KANA = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const FULL_KANA = 'ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
const DAKUTEN_BASE = 'カキクケコサシスセソタチツテトハヒフヘホ';
const HANDAKUTEN_BASE = 'ハヒフヘホ';

/** 半角カタカナ → 全角カタカナ（濁点・半濁点を結合） */
export function halfKanaToFull(s: string): string {
  let out = '';
  const chars = Array.from(s);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const idx = HALF_KANA.indexOf(ch);
    if (idx < 0) {
      out += ch;
      continue;
    }
    let full = FULL_KANA[idx];
    const next = chars[i + 1];
    if (next === 'ﾞ') {
      if (DAKUTEN_BASE.includes(full)) {
        full = String.fromCodePoint(full.codePointAt(0)! + 1);
        i++;
      } else if (full === 'ウ') {
        full = 'ヴ';
        i++;
      }
    } else if (next === 'ﾟ' && HANDAKUTEN_BASE.includes(full)) {
      full = String.fromCodePoint(full.codePointAt(0)! + 2);
      i++;
    }
    out += full;
  }
  return out.replace(/ﾞ/g, '゛').replace(/ﾟ/g, '゜');
}

/** 全角カタカナ → 半角カタカナ */
export function fullKanaToHalf(s: string): string {
  let out = '';
  for (const ch of s) {
    const idx = FULL_KANA.indexOf(ch);
    if (idx >= 0) {
      out += HALF_KANA[idx];
      continue;
    }
    const c = ch.codePointAt(0)!;
    // 濁音・半濁音: ガ(30AC) など
    const base = String.fromCodePoint(c - 1);
    if (DAKUTEN_BASE.includes(base)) {
      out += HALF_KANA[FULL_KANA.indexOf(base)] + 'ﾞ';
      continue;
    }
    const base2 = String.fromCodePoint(c - 2);
    if (HANDAKUTEN_BASE.includes(base2)) {
      out += HALF_KANA[FULL_KANA.indexOf(base2)] + 'ﾟ';
      continue;
    }
    if (ch === 'ヴ') {
      out += 'ｳﾞ';
      continue;
    }
    out += ch;
  }
  return out;
}

/** ひらがな → カタカナ */
export function hiraToKata(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x3041 && c <= 0x3096) || c === 0x309d || c === 0x309e) out += String.fromCodePoint(c + 0x60);
    else out += ch;
  }
  return out;
}

/** カタカナ → ひらがな */
export function kataToHira(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x30a1 && c <= 0x30f6) || c === 0x30fd || c === 0x30fe) out += String.fromCodePoint(c - 0x60);
    else out += ch;
  }
  return out;
}

export type ScriptKind = 'hiragana' | 'katakana' | 'mixed-kana' | 'other' | 'empty';

/** かな文字列の種別判定（空白・長音・中黒は無視。半角カナはカタカナ扱い） */
export function kanaScriptOf(s: string): ScriptKind {
  const body = halfKanaToFull(s).replace(/[\s　ー・=＝\-]/g, '');
  if (!body) return 'empty';
  let hira = 0;
  let kata = 0;
  let other = 0;
  for (const ch of body) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x3041 && c <= 0x309f)) hira++;
    else if (c >= 0x30a0 && c <= 0x30ff) kata++;
    else other++;
  }
  if (other > 0) return 'other';
  if (hira && kata) return 'mixed-kana';
  return hira ? 'hiragana' : 'katakana';
}

/** 種別を保ったまま空白を変換した文字列を返す補助 */
export function collapseSpaces(s: string): string {
  return s.replace(/[\s　]+/g, '');
}

/** 数字・英字・記号が全て半角ASCIIか */
export function isAllHalfAscii(s: string): boolean {
  return /^[\x20-\x7e]*$/.test(s);
}

/** 全角ASCII（英数記号）を含むか */
export function hasFullWidthAscii(s: string): boolean {
  return /[！-～　]/.test(s);
}

/**
 * かなを指定の文字種へ機械的に変換する。元がかなでない（漢字・英字を含む）場合は null。
 * @param halfKana true なら半角カタカナ（script=katakana のときのみ）
 */
export function convertKana(value: string, script: 'hiragana' | 'katakana', halfKana = false): string | null {
  const kind = kanaScriptOf(value);
  if (kind === 'other') return null;
  const full = halfKanaToFull(value);
  if (script === 'hiragana') return kataToHira(full);
  const kata = hiraToKata(full);
  return halfKana ? fullKanaToHalf(kata) : kata;
}
