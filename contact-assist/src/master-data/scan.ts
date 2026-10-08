/**
 * シートから「お問い合わせ情報」を取り出す。
 * ラベルと値が縦並び（ラベル | 値）でも、横並び（見出し行 + 値の行）でも読める。
 */
import type { MasterEntry, RawSheet } from '../shared/types';
import { isBlank } from '../schema/normalize';
import { parseMasterLabel, LabelInfo } from './labels';

export interface MasterScan {
  score: number;
  layout: 'vertical' | 'horizontal' | 'none';
  entries: MasterEntry[];
  unclassified: { label: string; value: string; excelRow: number }[];
  distinctFields: number;
  /** 横並びで値の行が複数あるなど、一意に決められない */
  problem?: string;
}

interface LabelCell {
  r: number;
  c: number;
  text: string;
  info: LabelInfo;
}

const MAX_RIGHT = 8;

/** メール・URL・電話番号など「値」に見えるセルはラベルとして扱わない */
function looksLikeValue(cell: string): boolean {
  const t = cell.normalize('NFKC').trim();
  return /[@]|https?:|:\/\//.test(t) || /^[\d\-+() ]+$/.test(t) || t.length > 25;
}

export function scanMaster(sheet: RawSheet): MasterScan {
  const labels: LabelCell[] = [];
  sheet.rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (isBlank(cell)) return;
      if (looksLikeValue(cell)) return;
      const info = parseMasterLabel(cell);
      if (info) labels.push({ r, c, text: cell, info });
    });
  });
  const none: MasterScan = { score: 0, layout: 'none', entries: [], unclassified: [], distinctFields: 0 };
  if (labels.length === 0) return none;

  const byCol = new Map<number, LabelCell[]>();
  const byRow = new Map<number, LabelCell[]>();
  for (const l of labels) {
    byCol.set(l.c, [...(byCol.get(l.c) ?? []), l]);
    byRow.set(l.r, [...(byRow.get(l.r) ?? []), l]);
  }
  const distinct = (ls: LabelCell[]) => new Set(ls.map((l) => l.info.field)).size;
  const bestCol = [...byCol.values()].sort((a, b) => distinct(b) - distinct(a))[0];
  const bestRow = [...byRow.values()].sort((a, b) => distinct(b) - distinct(a))[0];

  // 縦並び: 同じ列に複数のラベル。横並び: 同じ行に複数のラベル
  const vertical = distinct(bestCol) >= distinct(bestRow);
  const total = new Set(labels.map((l) => l.info.field)).size;
  if (total < 3) return { ...none, distinctFields: total };

  if (vertical) return scanVertical(sheet, labels);
  return scanHorizontal(sheet, bestRow);
}

function scanVertical(sheet: RawSheet, labels: LabelCell[]): MasterScan {
  // 複数の列がラベル列になっていてもよい（ラベル|値|ラベル|値）。ただしラベル列は2つ以上のラベルを持つ列に限る
  const colCounts = new Map<number, number>();
  for (const l of labels) colCounts.set(l.c, (colCounts.get(l.c) ?? 0) + 1);
  // 値の列にも偶然ラベルらしい文字列（例: 「…ビル」）が混ざるため、ラベル数が最大の列に近い列だけをラベル列とみなす
  const maxCount = Math.max(...colCounts.values());
  const labelCols = new Set([...colCounts.entries()].filter(([, n]) => n >= 2 && n >= maxCount * 0.6).map(([c]) => c));
  if (labelCols.size === 0) labelCols.add([...colCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]);

  const entries: MasterEntry[] = [];
  const used = new Set<string>();
  for (const l of labels) {
    if (!labelCols.has(l.c)) continue;
    const row = sheet.rows[l.r];
    const rights: { c: number; v: string }[] = [];
    for (let c = l.c + 1; c < Math.min(row.length, l.c + 1 + MAX_RIGHT); c++) {
      if (labelCols.has(c)) break; // 次のラベル列に到達
      if (!isBlank(row[c])) rights.push({ c, v: row[c] });
    }
    if (rights.length === 0) continue;
    // 電話番号・郵便番号が「080 | 1234 | 5678」のように複数セルに分かれている場合は、Excelに明示された分割値として読む
    const f = l.info.field;
    const groups = rights.map((x) => x.v.normalize('NFKC').trim());
    const allDigits = groups.every((g) => /^\d{2,5}$/.test(g));
    if ((f === 'phone' && !l.info.part && groups.length === 3 && allDigits) || (f === 'postal' && !l.info.part && groups.length === 2 && allDigits)) {
      rights.forEach((x, i) => {
        entries.push({
          field: `${f}${i + 1}` as MasterEntry['field'],
          value: x.v,
          label: l.text,
          sheet: sheet.name,
          excelRow: l.r + 1,
          part: i + 1,
          numeric: sheet.meta[`${l.r},${x.c}`]?.numeric,
        });
      });
      used.add(`${l.r},${l.c}`);
      continue;
    }
    const first = rights[0];
    entries.push({
      field: l.info.field,
      value: first.v,
      label: l.text,
      sheet: sheet.name,
      excelRow: l.r + 1,
      part: l.info.part,
      numeric: sheet.meta[`${l.r},${first.c}`]?.numeric,
    });
    used.add(`${l.r},${l.c}`);
  }

  // 辞書に無いラベル（参考表示）。ラベル列に値付きで存在するもの
  const unclassified: MasterScan['unclassified'] = [];
  const recognized = new Set(labels.map((l) => `${l.r},${l.c}`));
  sheet.rows.forEach((row, r) => {
    for (const c of labelCols) {
      const cell = row[c];
      if (isBlank(cell) || recognized.has(`${r},${c}`) || cell.length > 40 || /^(項目|項目名|内容|値|名称|ラベル|item|value)$/i.test(cell.trim())) continue;
      for (let cc = c + 1; cc < Math.min(row.length, c + 1 + MAX_RIGHT); cc++) {
        if (labelCols.has(cc)) break;
        if (isBlank(row[cc])) continue;
        unclassified.push({ label: cell, value: row[cc], excelRow: r + 1 });
        break;
      }
    }
  });

  const fields = new Set(entries.map((e) => e.field));
  const score = fields.size * 2 + (fields.has('phone') || fields.has('phone1') ? 1.5 : 0) + (fields.has('email') ? 1.5 : 0);
  return { score: fields.size >= 3 ? score : 0, layout: 'vertical', entries, unclassified, distinctFields: fields.size };
}

function scanHorizontal(sheet: RawSheet, headerLabels: LabelCell[]): MasterScan {
  const headerRow = headerLabels[0].r;
  const dataRows: number[] = [];
  for (let r = headerRow + 1; r < sheet.rows.length; r++) {
    if (headerLabels.some((l) => !isBlank(sheet.rows[r][l.c]))) dataRows.push(r);
  }
  const entries: MasterEntry[] = [];
  let problem: string | undefined;
  if (dataRows.length > 1) {
    problem = `送信者情報が複数行あります（${dataRows.map((r) => r + 1).join(', ')}行目）。どの行を使うか決められません`;
  }
  const r = dataRows[0];
  if (r !== undefined) {
    for (const l of headerLabels) {
      const v = sheet.rows[r][l.c];
      if (isBlank(v)) continue;
      entries.push({
        field: l.info.field,
        value: v,
        label: l.text,
        sheet: sheet.name,
        excelRow: r + 1,
        part: l.info.part,
        numeric: sheet.meta[`${r},${l.c}`]?.numeric,
      });
    }
  }
  const fields = new Set(entries.map((e) => e.field));
  const score = fields.size * 2 + (fields.has('phone') ? 1.5 : 0) + (fields.has('email') ? 1.5 : 0);
  return { score: fields.size >= 3 ? score : 0, layout: 'horizontal', entries, unclassified: [], distinctFields: fields.size, problem };
}
