/**
 * Excel 読込（読み取り専用）。
 * このモジュールは Excel を書き換える関数を持たない・呼ばない。
 * セルの文字列は Excel に書かれているままの状態で返す（trim等の加工をしない）。
 */
import { readFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import type { CellMeta, RawSheet, RawWorkbook } from '../shared/types';

const MAX_ROWS = 20000;
const MAX_COLS = 200;

function numberFormatDigits(fmt: string | undefined): number | null {
  // 0000000000 のようなゼロ埋め書式は桁数が分かる
  if (!fmt) return null;
  const m = /^0{2,}$/.exec(fmt);
  return m ? m[0].length : null;
}

/**
 * セルの値から文字列を取り出す。リッチテキスト・リンク付き・数式結果など入れ子の形にも対応する。
 * （リンク付きセルの text 自体がリッチテキストになっている実ファイルがある）
 */
function valueToText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.richText)) return (o.richText as { text?: unknown }[]).map((r) => valueToText(r.text)).join('');
    if ('text' in o) return valueToText(o.text);
    if ('result' in o) return valueToText(o.result);
    if ('error' in o) return valueToText(o.error);
  }
  return '';
}

function cellText(cell: ExcelJS.Cell): { text: string; meta?: CellMeta } {
  const v = cell.value as unknown;
  if (v === null || v === undefined) return { text: '' };
  // 結合セルの従属セルはマスターと同じ値が見えるので空扱いにする
  if (cell.isMerged && cell.master && cell.master.address !== cell.address) return { text: '' };

  let meta: CellMeta | undefined;
  if (typeof v === 'object' && v !== null && 'hyperlink' in (v as Record<string, unknown>)) {
    const link = (v as { hyperlink?: string }).hyperlink;
    if (link) meta = { hyperlink: link };
  }
  let result: unknown = v;
  if (typeof v === 'object' && v !== null && 'result' in (v as Record<string, unknown>)) {
    result = (v as { result?: unknown }).result;
  }
  if (typeof result === 'number') {
    const digits = numberFormatDigits(cell.numFmt);
    let text = String(result);
    if (digits && text.length < digits && /^\d+$/.test(text)) text = text.padStart(digits, '0');
    return { text, meta: { ...(meta ?? {}), numeric: true } };
  }
  let text = '';
  try {
    const t: unknown = cell.text;
    text = typeof t === 'string' ? t : valueToText(v);
  } catch {
    text = valueToText(v);
  }
  return { text, meta };
}

export async function readWorkbookFromBuffer(buf: Buffer | ArrayBuffer | Uint8Array): Promise<RawWorkbook> {
  const wb = new ExcelJS.Workbook();
  // exceljs は ArrayBuffer/Buffer を受け付ける。読み込みのみ。
  await wb.xlsx.load(buf as ArrayBuffer);
  const sheets: RawSheet[] = [];
  let index = 0;
  for (const ws of wb.worksheets) {
    const rowCount = Math.min(ws.rowCount, MAX_ROWS);
    const colCount = Math.min(ws.columnCount, MAX_COLS);
    const rows: string[][] = [];
    const meta: Record<string, CellMeta> = {};
    for (let r = 1; r <= rowCount; r++) {
      const row = ws.getRow(r);
      const out: string[] = [];
      for (let c = 1; c <= colCount; c++) {
        const { text, meta: m } = cellText(row.getCell(c));
        out.push(text);
        if (m) meta[`${r - 1},${c - 1}`] = m;
      }
      rows.push(out);
    }
    sheets.push({ name: ws.name, index: index++, rows, meta });
  }
  return { sheets };
}

export async function readWorkbookFromFile(path: string): Promise<RawWorkbook> {
  if (/\.xls$/i.test(path)) {
    throw new Error('古い形式(.xls)は読めません。Excelで「名前を付けて保存」から .xlsx 形式で保存し直してください。');
  }
  const buf = await readFile(path);
  return readWorkbookFromBuffer(buf);
}
