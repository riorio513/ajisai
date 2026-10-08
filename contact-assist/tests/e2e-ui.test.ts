/** 画面操作の通しテスト: Excel構造確認 → マッピング保存 → 次回の再検証 / マスター矛盾の解決 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright-core';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findChrome, startTestApp, type TestApp } from './helpers/app';
import { sheetsToBuffer } from './helpers/xlsx';
import { buildSampleSheets, type SheetSpec } from '../src/cli/sample-data';
import type { AppState } from '../src/shared/api';

let app: TestApp;
let browser: Browser;
let dir: string;
let xlsx: string;

/** 見出しが辞書にない、癖のあるExcel（企業名→「Target」、本文→「Msg」など） */
function oddSheets(order: 'normal' | 'moved' | 'renamed' = 'normal'): SheetSpec[] {
  const base = buildSampleSheets();
  const company: SheetSpec = {
    name: 'List',
    rows: [
      ['Target', 'Site', 'Memo2'],
      ['株式会社サンプル運輸', 'https://example.com/', ''],
      ['ダミー介護サービス株式会社', 'https://example.org/', ''],
    ],
  };
  const tpl: SheetSpec = {
    name: 'Texts',
    rows: [
      ['Ref', 'Position', 'Msg title', 'Msg'],
      ['A1', '運輸・物流（ドライバー）', 'Subject one', 'Body one'],
      ['A2', '介護・福祉', 'Subject two', 'Body two'],
    ],
  };
  if (order === 'moved') {
    company.rows = company.rows.map((r) => [r[2], r[1], r[0]]); // 列の並びを入れ替え
    tpl.rows = tpl.rows.map((r) => [r[3], r[2], r[1], r[0]]);
  }
  if (order === 'renamed') {
    company.rows[0][0] = 'Customer'; // 見出しの文字が変わった
  }
  return [tpl, company, base[1]];
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'ca-ui-'));
  xlsx = join(dir, 'odd.xlsx');
  writeFileSync(xlsx, await sheetsToBuffer(oddSheets()));
  app = await startTestApp(join(dir, 'data'));
  browser = await chromium.launch({ headless: true, executablePath: findChrome() });
});
afterAll(async () => {
  await browser?.close();
  await app?.stop();
});

describe('Excel構造確認 → マッピング保存 → 再検証', () => {
  it('辞書にない見出しは「Excel構造確認が必要」で止まり、画面で列を選べる', async () => {
    await app.post('/api/excel/load', { path: xlsx });
    const s0 = await app.get<AppState>('/api/state');
    expect(s0.structure?.status).toBe('needs-confirmation');
    expect(s0.companies).toEqual([]); // 推測で進めない

    const ctx = await browser.newContext({ viewport: { width: 1300, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(app.base + '/');
    await page.waitForSelector('text=Excel構造確認が必要');

    // 企業一覧の枠
    const companyCard = page.locator('section.card', { has: page.locator('h3', { hasText: '企業一覧' }) });
    await companyCard.locator('select').first().selectOption('List');
    await page.waitForSelector('.preview');
    const pickers = companyCard.locator('.field-pickers select');
    // 「企業名に使う列」= A列:Target
    await companyCard.locator('.field-pickers label', { hasText: '企業名' }).locator('select').selectOption({ label: 'A列：Target' });
    await companyCard.locator('.field-pickers label', { hasText: '企業URL' }).locator('select').selectOption({ label: 'B列：Site' });
    expect(await pickers.count()).toBeGreaterThan(2);
    await page.screenshot({ path: join(tmpdir(), 'ui-mapping.png') });
    await companyCard.getByRole('button', { name: /この設定で読み込む/ }).click();

    // 文面一覧の枠
    await page.waitForSelector('section.card h3:has-text("文面一覧")');
    const tplCard = page.locator('section.card', { has: page.locator('h3', { hasText: '文面一覧' }) });
    await tplCard.locator('select').first().selectOption('Texts');
    await page.waitForSelector('section.card:has(h3:has-text("文面一覧")) .preview');
    await tplCard.locator('.field-pickers label', { hasText: '本文' }).locator('select').selectOption({ label: 'D列：Msg' });
    await tplCard.locator('.field-pickers label', { hasText: '職種' }).locator('select').selectOption({ label: 'B列：Position' });
    await tplCard.locator('.field-pickers label', { hasText: '件名' }).locator('select').selectOption({ label: 'C列：Msg title' });
    await tplCard.locator('.field-pickers label', { hasText: '文面番号' }).locator('select').selectOption({ label: 'A列：Ref' });
    await tplCard.getByRole('button', { name: /この設定で読み込む/ }).click();

    await page.waitForSelector('.company-list li');
    const s1 = await app.get<AppState>('/api/state');
    expect(s1.structure?.status).toBe('ok');
    expect(s1.companies.map((c) => c.name)).toEqual(['株式会社サンプル運輸', 'ダミー介護サービス株式会社']);
    expect(s1.jobs.map((j) => j.label)).toEqual(['運輸・物流（ドライバー）', '介護・福祉']);
    await ctx.close();
  });

  it('次回の読み込みでは、保存した設定を見出し文字で再検証して使う（列が動いても追従）', async () => {
    await app.stop();
    app = await startTestApp(join(dir, 'data'));
    writeFileSync(xlsx, await sheetsToBuffer(oddSheets('moved')));
    await app.post('/api/excel/load', { path: xlsx });
    const s = await app.get<AppState>('/api/state');
    expect(s.structure?.status).toBe('ok');
    expect(s.structure?.usedSavedMapping.company).toBe(true);
    expect(s.structure?.mappingNotes.join('\n')).toContain('再検証');
    expect(s.companies.map((c) => c.name)).toEqual(['株式会社サンプル運輸', 'ダミー介護サービス株式会社']);
  });

  it('見出しが変わっていたら、保存済み設定を盲目的に使わず止まる', async () => {
    writeFileSync(xlsx, await sheetsToBuffer(oddSheets('renamed')));
    await app.post('/api/excel/reload');
    const s = await app.get<AppState>('/api/state');
    expect(s.structure?.status).toBe('needs-confirmation');
    expect(s.structure?.mappingNotes.join('\n')).toContain('一致しない');
    expect(s.companies).toEqual([]);
  });
});

describe('マスターデータ矛盾の画面操作', () => {
  it('候補を選ぶと解決し、Excelは変わらない', async () => {
    const sheets = buildSampleSheets();
    sheets[1].rows.push(['携帯番号', '090-9999-0000']);
    const file = join(dir, 'conflict.xlsx');
    writeFileSync(file, await sheetsToBuffer(sheets));
    await app.post('/api/excel/load', { path: file });
    const s0 = await app.get<AppState>('/api/state');
    expect(s0.conflicts.length).toBe(1);

    const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(app.base + '/');
    await page.waitForSelector('.conflict');
    expect(await page.locator('.conflict h2').textContent()).toBe('マスターデータ矛盾');
    const text = await page.locator('.conflict').textContent();
    expect(text).toContain('080-1234-5678');
    expect(text).toContain('090-9999-0000');
    await page.screenshot({ path: join(tmpdir(), 'ui-conflict.png') });
    await page.locator('.conflict-cand', { hasText: '090-9999-0000' }).getByRole('button', { name: 'この値を使う' }).click();
    await page.waitForSelector('.conflict', { state: 'detached' });
    const s1 = await app.get<AppState>('/api/state');
    expect(s1.conflicts).toEqual([]);
    expect(s1.resolvedConflicts[0].chosen).toBe('090-9999-0000');
    await ctx.close();
  });
});
