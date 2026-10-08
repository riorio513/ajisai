/**
 * 問い合わせ情報マスターの組み立てと矛盾検出。
 * 同じ意味の項目に異なる値がある場合は、どちらも採用せず「矛盾」として停止する。
 */
import type { ConflictCandidate, MasterConflict, MasterData, MasterEntry, MasterFieldId } from '../shared/types';
import { hashString } from '../schema/normalize';
import { digitsOf, hiraToKata, normalizeKey, splitPrefecture } from '../transformer';

const KANA_FIELDS = new Set<MasterFieldId>(['companyKana', 'fullKana', 'lastKana', 'firstKana']);
const DIGIT_FIELDS = new Set<MasterFieldId>(['phone', 'phone1', 'phone2', 'phone3', 'postal', 'postal1', 'postal2']);

/** 「同じ値」とみなす比較キー（全角半角・空白・ハイフン・かな種別の違いは同じ値） */
export function equivalenceKey(field: MasterFieldId, value: string): string {
  if (DIGIT_FIELDS.has(field)) return digitsOf(value);
  if (KANA_FIELDS.has(field)) return hiraToKata(normalizeKey(value));
  if (field === 'email') return value.trim();
  return normalizeKey(value);
}

export const FIELD_TITLE: Partial<Record<MasterFieldId, string>> = {
  companyName: '会社名', companyKana: '会社名カナ', department: '部署', position: '役職',
  fullName: '氏名', lastName: '姓', firstName: '名', fullKana: 'フリガナ', lastKana: '姓フリガナ', firstKana: '名フリガナ',
  email: 'メールアドレス', phone: '電話番号', phone1: '電話番号①', phone2: '電話番号②', phone3: '電話番号③',
  postal: '郵便番号', postal1: '郵便番号①', postal2: '郵便番号②', address: '住所', prefecture: '都道府県',
  city: '市区町村', town: '町域', street: '番地', building: '建物名', url: '会社URL', inquiryType: '問い合わせ種別',
};

function candidateId(apply: Record<string, string>, drop?: string[]): string {
  return hashString(JSON.stringify([apply, drop ?? []]));
}

function makeConflict(group: string, title: string, candidates: ConflictCandidate[]): MasterConflict {
  const sorted = candidates.map((c) => c.id).sort().join('|');
  return { id: `${group}:${hashString(sorted)}`, fieldGroup: group, title, candidates };
}

export interface BuildOptions {
  /** conflict.id -> 選択した candidate.id（ローカル保存された、ユーザーの選択） */
  overrides?: Record<string, string>;
}

/** 連番ラベル(電話番号1/2/3)を整理する */
function normalizeEntries(entries: MasterEntry[]): MasterEntry[] {
  const out: MasterEntry[] = [];
  const addressParts: MasterEntry[] = [];
  for (const e of entries) {
    if (/^(phone[123])$/.test(e.field) && digitsOf(e.value).length > 5) {
      out.push({ ...e, field: 'phone' }); // 分割値ではなく、別の電話番号
    } else if (/^(postal[12])$/.test(e.field) && digitsOf(e.value).length > 4) {
      out.push({ ...e, field: 'postal' });
    } else if (e.field === 'address' && e.part) {
      addressParts.push(e);
    } else {
      out.push(e);
    }
  }
  if (addressParts.length) {
    const sorted = [...addressParts].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
    out.push({ ...sorted[0], value: sorted.map((p) => p.value).join(''), label: sorted.map((p) => p.label).join('+'), part: undefined });
  }
  return out;
}

export function buildMaster(rawEntries: MasterEntry[], unclassified: MasterData['unclassified'], sheet: string | undefined, opts: BuildOptions = {}): MasterData {
  const overrides = opts.overrides ?? {};
  const entries = normalizeEntries(rawEntries);
  const conflicts: MasterConflict[] = [];
  const resolved: MasterData['resolved'] = [];
  const values: Partial<Record<MasterFieldId, string>> = {};
  const variants: Partial<Record<MasterFieldId, string[]>> = {};
  const numericSuspect: MasterFieldId[] = [];

  const settle = (conflict: MasterConflict): ConflictCandidate | null => {
    const chosenId = overrides[conflict.id];
    const chosen = conflict.candidates.find((c) => c.id === chosenId);
    if (chosen) {
      resolved.push({ id: conflict.id, title: conflict.title, chosen: chosen.display });
      return chosen;
    }
    conflicts.push(conflict);
    return null;
  };

  // 1) 同じ項目の中での矛盾
  const byField = new Map<MasterFieldId, MasterEntry[]>();
  for (const e of entries) byField.set(e.field, [...(byField.get(e.field) ?? []), e]);

  for (const [field, list] of byField) {
    // 数値セルで先頭0が欠けている疑い
    const numericSusp = list.filter((e) => e.numeric && isZeroLossSuspect(field, e.value));
    const groups = new Map<string, MasterEntry[]>();
    for (const e of list) {
      const k = equivalenceKey(field, e.value);
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    if (groups.size === 1) {
      const only = [...groups.values()][0];
      if (numericSusp.length && numericSusp.length === list.length) {
        const raw = only[0].value;
        const padded = '0' + digitsOf(raw);
        const cands: ConflictCandidate[] = [
          { apply: { [field]: padded }, label: '先頭に0を補う', display: padded },
          { apply: { [field]: raw }, label: 'そのまま', display: raw },
        ].map((c) => ({ ...c, id: candidateId(c.apply) }));
        const c = settle(makeConflict(`zero:${field}`,
          `${FIELD_TITLE[field] ?? field}が数値として保存されており、先頭の0が欠けている可能性があります（Excel ${only[0].excelRow}行目）`, cands));
        if (c) {
          values[field] = c.apply[field];
          variants[field] = [c.apply[field]!];
        }
        continue;
      }
      values[field] = only[0].value;
      variants[field] = [...new Set(list.map((e) => e.value))];
      continue;
    }
    const cands: ConflictCandidate[] = [...groups.values()].map((g) => {
      const apply = { [field]: g[0].value };
      return {
        id: candidateId(apply),
        label: `${g[0].label}（Excel ${g[0].excelRow}行目）`,
        display: g[0].value,
        apply,
      };
    });
    const c = settle(makeConflict(`field:${field}`, `${FIELD_TITLE[field] ?? field}の候補が一致しません`, cands));
    if (c) {
      values[field] = c.apply[field];
      variants[field] = [c.apply[field]!];
    }
  }

  // 2) 項目をまたぐ矛盾（氏名 vs 姓+名 など）
  const cross = (
    group: string,
    title: string,
    whole: MasterFieldId,
    parts: MasterFieldId[],
    composeKey: (vals: string[]) => string,
    wholeKey: (v: string) => string,
    partsDisplay: (vals: string[]) => string,
  ) => {
    const w = values[whole];
    if (w === undefined || parts.some((p) => values[p] === undefined)) return;
    const pv = parts.map((p) => values[p]!);
    if (wholeKey(w) === composeKey(pv)) return;
    const cands: ConflictCandidate[] = [
      { apply: { [whole]: w }, drop: parts, label: `${FIELD_TITLE[whole]}の欄`, display: w },
      {
        apply: Object.fromEntries(parts.map((p, i) => [p, pv[i]])),
        drop: [whole],
        label: parts.map((p) => FIELD_TITLE[p]).join('+') + 'の欄',
        display: partsDisplay(pv),
      },
    ].map((c) => ({ ...c, id: candidateId(c.apply as Record<string, string>, c.drop as string[]) }));
    const chosen = settle(makeConflict(group, title, cands));
    if (chosen) {
      for (const d of chosen.drop ?? []) delete values[d];
      for (const [k, v] of Object.entries(chosen.apply)) values[k as MasterFieldId] = v;
    }
  };

  const nameKey = (s: string) => normalizeKey(s);
  cross('cross:name', '氏名と、姓・名の組み合わせが一致しません', 'fullName', ['lastName', 'firstName'],
    (v) => nameKey(v.join('')), nameKey, (v) => v.join(' '));
  cross('cross:kana', 'フリガナと、姓・名のフリガナの組み合わせが一致しません', 'fullKana', ['lastKana', 'firstKana'],
    (v) => hiraToKata(nameKey(v.join(''))), (s) => hiraToKata(nameKey(s)), (v) => v.join(' '));
  cross('cross:phone', '電話番号と、分割された電話番号が一致しません', 'phone', ['phone1', 'phone2', 'phone3'],
    (v) => digitsOf(v.join('')), digitsOf, (v) => v.join('-'));
  cross('cross:postal', '郵便番号と、分割された郵便番号が一致しません', 'postal', ['postal1', 'postal2'],
    (v) => digitsOf(v.join('')), digitsOf, (v) => v.join('-'));

  // 住所: 全文と、分割された住所（都道府県・市区町村・町域・番地・建物）が食い違っていないか
  {
    const pieces: MasterFieldId[] = ['prefecture', 'city', 'town', 'street', 'building'];
    const full = values.address;
    const present = pieces.filter((p) => values[p] !== undefined);
    if (full !== undefined && present.includes('city') && present.length >= 2) {
      // 分割側に都道府県が無いときは、全文の先頭の都道府県名を補って比べる（機械的な補完）
      const derivedPref = values.prefecture === undefined ? splitPrefecture(full)?.prefecture : undefined;
      const joined = (derivedPref ?? '') + present.map((p) => values[p]).join('');
      if (nameKey(full) !== nameKey(joined)) {
        const pieceApply = Object.fromEntries(present.map((p) => [p, values[p]!]));
        if (derivedPref) pieceApply.prefecture = derivedPref;
        const cands: ConflictCandidate[] = [
          { apply: { address: full } as Record<string, string>, drop: pieces, label: '住所（全文）の欄', display: full },
          { apply: pieceApply, drop: ['address'] as MasterFieldId[], label: '分割された住所の欄', display: joined },
        ].map((c) => ({ ...c, id: candidateId(c.apply, c.drop) }));
        const chosen = settle(makeConflict('cross:address', '住所（全文）と、分割された住所が一致しません', cands));
        if (chosen) {
          for (const d of chosen.drop ?? []) delete values[d];
          for (const [k, v] of Object.entries(chosen.apply)) values[k as MasterFieldId] = v;
        }
      }
    }
  }

  // 数値セルの先頭0欠落疑いは、分割値には適用しない（分割値は短いのが普通）
  for (const f of Object.keys(values) as MasterFieldId[]) {
    if (conflicts.some((c) => c.id.startsWith(`zero:${f}`))) numericSuspect.push(f);
  }

  const sources: MasterData['sources'] = {};
  for (const f of Object.keys(values) as MasterFieldId[]) {
    const key = equivalenceKey(f, values[f]!);
    const cells = entries.filter((e) => e.field === f && e.cell && equivalenceKey(f, e.value) === key).map((e) => e.cell!);
    if (cells.length) sources[f] = [...new Set(cells)];
  }
  return { values, variants, numericSuspect, conflicts, resolved, unclassified, sheet, sources };
}

function isZeroLossSuspect(field: MasterFieldId, value: string): boolean {
  const d = digitsOf(value);
  if (field === 'phone') return /^[1-9]\d{8,9}$/.test(d); // 先頭0の無い9〜10桁
  if (field === 'postal') return d.length === 6;
  return false;
}
