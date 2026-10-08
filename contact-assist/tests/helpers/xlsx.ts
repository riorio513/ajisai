import ExcelJS from 'exceljs';
import type { SheetSpec } from '../../src/cli/sample-data';
import { readWorkbookFromBuffer } from '../../src/excel/reader';
import { buildModel, ModelOptions } from '../../src/schema/model';
import { buildSampleSheets, SampleOptions } from '../../src/cli/sample-data';

/** テスト用: シート仕様から xlsx のバッファを作る（テスト専用。アプリ本体は Excel を書かない） */
export async function sheetsToBuffer(sheets: SheetSpec[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name);
    s.rows.forEach((row, r) => {
      row.forEach((v, c) => {
        if (v !== null && v !== undefined && v !== '') ws.getCell(r + 1, c + 1).value = v;
      });
    });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function modelFrom(sheets: SheetSpec[], opts: ModelOptions = {}) {
  const raw = await readWorkbookFromBuffer(await sheetsToBuffer(sheets));
  return buildModel(raw, opts);
}

export async function sampleModel(o: SampleOptions = {}, opts: ModelOptions = {}) {
  return modelFrom(buildSampleSheets(o), opts);
}
