/**
 * 実際のExcelで見つかった「2ブロック型」の問い合わせ情報（架空データで再現）:
 *   B:C = ラベル｜値（全体）   E:I = 同じラベル｜分割値（姓・名、電話3分割、住所の分割、フリガナ…）
 *   J   = ラベルのない値の一覧（並び順がラベルと一致しない）
 */
import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { modelFrom, sheetsToBuffer } from './helpers/xlsx';
import { buildSampleSheets, type SheetSpec } from '../src/cli/sample-data';
import { readWorkbookFromBuffer } from '../src/excel/reader';

function blockMaster(opts: { phoneMismatch?: boolean; partsWrong?: boolean } = {}): SheetSpec {
  const N: null = null;
  const phoneFull = '08012345678';
  const rows: (string | null)[][] = [
    [],
    [N, '会社名', 'TEST商事株式会社', N, '会社名', 'テストショウジ', N, N, 'ＴＥＳＴ商事株式会社', 'TEST商事株式会社'],
    [N, '部署', '採用事業部', N, '部署', N, N, N, N, '採用事業部'],
    [N, '役職', '部長', N, '役職', N, N, N, N, '部長'],
    [N, '名前', '山田 太郎', N, '名前', '山田', '太郎', N, N, '山田 太郎'],
    [N, 'なまえ', 'やまだ たろう', N, 'なまえ', 'ヤマダ', 'タロウ', 'やまだ', 'たろう', 'ヤマダタロウ'],
    [N, 'メールアドレス', 'taro@example.co.jp', N, 'メールアドレス', 'taro', 'example.co.jp', N, N, 'やまだ'],
    opts.partsWrong
      ? [N, '電話番号', phoneFull, N, '電話番号', '080', '9999', '0000', '08099990000', 'taro@example.co.jp']
      : [N, '電話番号', opts.phoneMismatch ? '08099990000' : phoneFull, N, '電話番号', '080', '1234', '5678', phoneFull, 'taro@example.co.jp'],
    [N, '住所', '東京都新宿区西新宿6丁目12番3号 サンプルビル7階', N, '住所', '新宿区', '西新宿', '6丁目12番3号', 'サンプルビル7階', '160-0023'],
    [N, '郵便番号', '160-0023', N, '郵便番号', '160', '0023', N, '1600023', '東京都新宿区西新宿6丁目12番3号 サンプルビル7階'],
    [N, 'HP', 'https://example.co.jp/', N, 'HP', N, N, N, N, '080-1234-5678'],
  ];
  return { name: 'お問い合わせ情報', rows };
}

async function model(opts?: Parameters<typeof blockMaster>[0]) {
  const s = buildSampleSheets();
  s[1] = blockMaster(opts);
  return modelFrom(s);
}

describe('2ブロック型の問い合わせ情報', () => {
  it('分割値を「明示された分割」として読み、矛盾にしない', async () => {
    const m = await model();
    expect(m.structure.status).toBe('ok');
    expect(m.master!.conflicts).toEqual([]);
    const v = m.master!.values;
    expect(v).toMatchObject({
      companyName: 'TEST商事株式会社', companyKana: 'テストショウジ', department: '採用事業部', position: '部長',
      fullName: '山田 太郎', lastName: '山田', firstName: '太郎', email: 'taro@example.co.jp',
      phone1: '080', phone2: '1234', phone3: '5678', postal1: '160', postal2: '0023',
      city: '新宿区', town: '西新宿', street: '6丁目12番3号', building: 'サンプルビル7階',
    });
    // 「なまえ」の行はフリガナ（氏名ではない）。ひらがな・カタカナ・分割が同じ内容として一致している
    expect(v.fullKana).toBeDefined();
    expect(v.lastKana).toBe('ヤマダ');
    expect(v.firstKana).toBe('タロウ');
    expect(v.fullName).not.toMatch(/やまだ/);
  });
  it('ラベルと型が合わない右端の値の一覧(J列)は読み飛ばす', async () => {
    const m = await model();
    expect(m.master!.values.email).toBe('taro@example.co.jp');
    expect(m.master!.values.url).toBe('https://example.co.jp/');
  });
  it('ブロック間で電話番号が食い違うときは、勝手に選ばず矛盾として止まる', async () => {
    const m = await model({ phoneMismatch: true });
    const c = m.master!.conflicts.find((x) => x.fieldGroup === 'field:phone');
    expect(c).toBeTruthy();
    expect(c!.candidates.map((x) => x.display).sort()).toEqual(['08012345678', '08099990000']);
  });
});

describe('読み取り結果の確認（どのセルから読んだか）', () => {
  it('採用した値ごとに、元のセル番号が分かる', async () => {
    const m = await model();
    const src = m.master!.sources;
    expect(src.companyName).toContain('C2');
    expect(src.phone1).toEqual(['F8']);
    expect(src.phone3).toEqual(['H8']);
    expect(src.city).toEqual(['F9']);
    expect(src.building).toEqual(['I9']);
    expect(src.lastName).toEqual(['F5']);
  });
});

describe('片方のブロックだけ誤りがあるとき（人が直した/選んだ内容で解決できる）', () => {
  it('全体を選ぶと、次は「分割との不一致」を聞かれ、全体を選べば分割は規則で作り直される', async () => {
    const s = buildSampleSheets();
    s[1] = blockMaster({ partsWrong: true });
    const m1 = await modelFrom(s);
    const c1 = m1.master!.conflicts.find((c) => c.fieldGroup === 'field:phone')!;
    expect(c1.candidates.length).toBe(2);
    const full = c1.candidates.find((c) => c.display === '08012345678')!;
    const m2 = await modelFrom(s, { masterOverrides: { [c1.id]: full.id } });
    const c2 = m2.master!.conflicts.find((c) => c.fieldGroup === 'cross:phone')!;
    expect(c2).toBeTruthy();
    const keepFull = c2.candidates.find((c) => c.apply.phone === '08012345678')!;
    const m3 = await modelFrom(s, { masterOverrides: { [c1.id]: full.id, [c2.id]: keepFull.id } });
    expect(m3.master!.conflicts).toEqual([]);
    expect(m3.master!.values.phone).toBe('08012345678');
    expect(m3.master!.values.phone1).toBeUndefined();
  });
});

describe('Excelの特殊なセル', () => {
  it('リンク付き＋リッチテキストのセルも、文字列として原文どおりに読める', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('文面');
    ws.getCell('A1').value = '本文';
    ws.getCell('A2').value = { text: { richText: [{ text: '先頭の改行を含む\n' }, { text: '本文です。', font: { bold: true } }] }, hyperlink: 'https://example.com/' } as unknown as ExcelJS.CellValue;
    const raw = await readWorkbookFromBuffer(Buffer.from(await wb.xlsx.writeBuffer()));
    expect(raw.sheets[0].rows[1][0]).toBe('先頭の改行を含む\n本文です。');
  });
  it('「null」などURLでない文字は、URLとして使わず警告する', async () => {
    const s: SheetSpec[] = buildSampleSheets();
    s[0].rows[1][1] = 'null';
    const m = await modelFrom(s);
    expect(m.quality.map((q) => q.code)).toContain('url-format');
    expect(m.companies[0].url).toBe('null'); // 原文は変えない
  });
});

void sheetsToBuffer;
