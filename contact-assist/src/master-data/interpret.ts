/**
 * 「ラベル」の右に並んだセルの中身を、項目の意味と値の型（メール・数字・かな・漢字…）から読み解く。
 *
 *  例:  電話番号 | 080 | 1234 | 5678 | 08012345678     → 電話①②③ と 電話番号(全体)
 *       名前     | 山田 | 太郎 | 山田 太郎              → 姓・名・氏名
 *       住所     | 東京都 | 新宿区 | 西新宿1-1-1 | ○○ビル → 都道府県・市区町村・番地・建物
 *
 * 項目と型が合わないセル（例: 電話番号の行にあるメールアドレス）は読み飛ばす。
 * 読み方が一つに決まらないときは、全セルを「同じ項目の別の値」として返し、後段の矛盾検出に任せる（推測しない）。
 */
import type { MasterFieldId } from '../shared/types';
import { hiraToKata, kanaScriptOf, normalizeKey, PREFECTURES } from '../transformer';
import type { LabelInfo } from './labels';

export interface Interpreted {
  field: MasterFieldId;
  value: string;
  part?: number;
  /** 右側セルの何番目か（数値セル判定などに使う） */
  idx: number;
}

type CellType = 'email' | 'url' | 'digitgroup' | 'numeric' | 'kana' | 'alnum' | 'text';

export function cellType(raw: string): CellType {
  const t = raw.normalize('NFKC').trim();
  if (/^\S+@\S+\.\S+$/.test(t)) return 'email';
  if (/^https?:\/\//i.test(t)) return 'url';
  if (/^\d{1,5}$/.test(t)) return 'digitgroup';
  if (/^[\d\-+() ]+$/.test(t)) return 'numeric';
  const k = kanaScriptOf(t);
  if (k === 'hiragana' || k === 'katakana') return 'kana';
  if (/^[A-Za-z0-9._+\-]+$/.test(t)) return 'alnum';
  return 'text';
}

const isTextLike = (t: CellType) => t === 'text' || t === 'kana' || t === 'alnum';
const digitsLen = (s: string) => s.normalize('NFKC').replace(/\D/g, '').length;
const nk = (s: string) => normalizeKey(s);
const nkKana = (s: string) => hiraToKata(normalizeKey(s));
const hasSpace = (s: string) => /^\S+[ 　]+\S+$/.test(s.trim());

interface Cell {
  v: string;
  idx: number;
}

/** 姓・名・氏名の並びを読み解く。確定できなければ全て「氏名の別表記」として返す */
function nameGroup(cells: Cell[], kana: boolean): Interpreted[] {
  const key = kana ? nkKana : nk;
  const full: MasterFieldId = kana ? 'fullKana' : 'fullName';
  const last: MasterFieldId = kana ? 'lastKana' : 'lastName';
  const first: MasterFieldId = kana ? 'firstKana' : 'firstName';
  const as = (field: MasterFieldId, c: Cell): Interpreted => ({ field, value: c.v, idx: c.idx });
  const allFull = () => cells.map((c) => as(full, c));
  if (cells.length === 1) return allFull();
  if (cells.length === 2) {
    if (hasSpace(cells[0].v) || hasSpace(cells[1].v)) return allFull();
    return [as(last, cells[0]), as(first, cells[1])];
  }
  if (cells.length === 3) {
    if (key(cells[0].v + cells[1].v) === key(cells[2].v)) return [as(last, cells[0]), as(first, cells[1]), as(full, cells[2])];
    if (key(cells[1].v + cells[2].v) === key(cells[0].v)) return [as(full, cells[0]), as(last, cells[1]), as(first, cells[2])];
  }
  return allFull();
}

const BUILDING_HINT = /ビル|マンション|ハイツ|コーポ|タワー|レジデンス|アパート|ヴィラ|荘|棟|号室|[0-9０-９]+階|[0-9０-９]F\b|ＦＦ|\bF\b|センター|プラザ|館/;

/**
 * 住所が複数セルに分かれているときの役割を、内容から決める。
 * 先頭が都道府県名 or 「〇〇区/市/町/村」であることを必須とし、決められなければ null（全セルを住所の別表記として扱う）。
 */
function addressRoles(v: string[]): MasterFieldId[] | null {
  const roles: MasterFieldId[] = [];
  let i = 0;
  if (PREFECTURES.includes(v[0].trim())) {
    roles.push('prefecture');
    i = 1;
  }
  if (i < v.length && /[市区町村郡]$/.test(v[i].trim()) && v[i].trim().length <= 8) {
    roles.push('city');
    i++;
  } else if (roles.length === 0) return null;
  const rest = v.slice(i);
  if (rest.length === 0) return null;
  if (rest.length === 1) roles.push('street');
  else if (rest.length === 2) roles.push(...((BUILDING_HINT.test(rest[1]) ? ['street', 'building'] : ['town', 'street']) as MasterFieldId[]));
  else if (rest.length === 3) roles.push('town', 'street', 'building');
  else return null;
  return roles;
}

export function interpretRow(info: LabelInfo, rawCells: string[]): Interpreted[] {
  const cells: Cell[] = rawCells.map((v, idx) => ({ v, idx }));
  const typed = cells.map((c) => ({ ...c, t: cellType(c.v) }));
  const out: Interpreted[] = [];
  const push = (field: MasterFieldId, c: Cell, part?: number) => out.push({ field, value: c.v, idx: c.idx, part });
  const f = info.field;

  switch (f) {
    case 'email': {
      const emails = typed.filter((c) => c.t === 'email');
      emails.forEach((c) => push('email', c));
      if (emails.length === 0) {
        // 「ローカル部 | ドメイン」のように@で分かれている場合
        const parts = typed.filter((c) => c.t === 'alnum');
        if (parts.length === 2 && parts[1].v.includes('.')) out.push({ field: 'email', value: `${parts[0].v}@${parts[1].v}`, idx: parts[0].idx });
      }
      break;
    }
    case 'phone':
    case 'phone1':
    case 'phone2':
    case 'phone3': {
      const groups = typed.filter((c) => c.t === 'digitgroup');
      const fulls = typed.filter((c) => (c.t === 'numeric' || c.t === 'digitgroup') && digitsLen(c.v) >= 10 && digitsLen(c.v) <= 11);
      if (info.part) {
        groups.forEach((c) => push(f, c, info.part));
        break;
      }
      fulls.forEach((c) => push('phone', c));
      if (groups.length === 3) groups.forEach((c, i) => push(`phone${i + 1}` as MasterFieldId, c, i + 1));
      break;
    }
    case 'postal':
    case 'postal1':
    case 'postal2': {
      const groups = typed.filter((c) => c.t === 'digitgroup');
      const fulls = typed.filter((c) => (c.t === 'numeric' || c.t === 'digitgroup') && digitsLen(c.v) === 7);
      if (info.part) {
        groups.forEach((c) => push(f, c, info.part));
        break;
      }
      fulls.forEach((c) => push('postal', c));
      const g = groups.filter((c) => digitsLen(c.v) <= 4);
      if (g.length === 2 && digitsLen(g[0].v) === 3 && digitsLen(g[1].v) === 4) g.forEach((c, i) => push(`postal${i + 1}` as MasterFieldId, c, i + 1));
      break;
    }
    case 'url':
      typed.filter((c) => c.t === 'url' || /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(c.v.trim())).forEach((c) => push('url', c));
      break;
    case 'address': {
      const el = typed.filter((c) => isTextLike(c.t));
      const roles = el.length >= 2 ? addressRoles(el.map((c) => c.v)) : null;
      if (roles) el.forEach((c, i) => push(roles[i], c));
      else el.forEach((c) => push('address', c));
      break;
    }
    case 'fullName':
    case 'lastName':
    case 'firstName': {
      if (f === 'fullName') {
        const kanji = typed.filter((c) => c.t === 'text' || c.t === 'alnum');
        const kanaCells = typed.filter((c) => c.t === 'kana');
        if (kanji.length) out.push(...nameGroup(kanji, false));
        // かなだけの行（「なまえ」「ふりがな」など）は、かなの項目として読む
        const kata = kanaCells.filter((c) => kanaScriptOf(c.v) === 'katakana');
        const hira = kanaCells.filter((c) => kanaScriptOf(c.v) === 'hiragana');
        for (const grp of [kata, hira]) if (grp.length) out.push(...nameGroup(grp, true));
      } else {
        typed.filter((c) => isTextLike(c.t)).forEach((c) => push(f, c));
      }
      break;
    }
    case 'fullKana': {
      const kata = typed.filter((c) => kanaScriptOf(c.v) === 'katakana');
      const hira = typed.filter((c) => kanaScriptOf(c.v) === 'hiragana');
      for (const grp of [kata, hira]) if (grp.length) out.push(...nameGroup(grp, true));
      if (kata.length + hira.length === 0) typed.filter((c) => isTextLike(c.t)).forEach((c) => push('fullKana', c));
      break;
    }
    case 'companyName': {
      typed.filter((c) => c.t === 'kana').forEach((c) => push('companyKana', c));
      typed.filter((c) => c.t === 'text' || c.t === 'alnum').forEach((c) => push('companyName', c));
      break;
    }
    default:
      // 部署・役職・建物名・問い合わせ種別など: 型が合うセルをすべて「同じ項目の値」として返す
      typed.filter((c) => isTextLike(c.t)).forEach((c) => push(f, c, info.part));
  }
  return out;
}
