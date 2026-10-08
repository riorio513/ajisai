/**
 * 動作確認用のダミーExcelを新規作成する（samples/sample.xlsx）。
 * アプリ本体とは無関係の補助ツール。既存のExcelは書き換えない。
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { buildSampleSheets } from './sample-data';

async function main() {
  const dir = join(process.cwd(), 'samples');
  mkdirSync(dir, { recursive: true });
  const wb = new ExcelJS.Workbook();
  for (const s of buildSampleSheets()) {
    const ws = wb.addWorksheet(s.name);
    s.rows.forEach((row, r) => row.forEach((v, c) => {
      if (v !== null && v !== '') ws.getCell(r + 1, c + 1).value = v;
    }));
    ws.columns.forEach((col) => (col.width = 24));
  }
  const out = join(dir, 'sample.xlsx');
  await wb.xlsx.writeFile(out);
  console.log(`作成しました: ${out}`);
  console.log('（架空のデータです。アプリの動作確認に使えます）');
}
void main();
