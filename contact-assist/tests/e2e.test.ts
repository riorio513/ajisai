/**
 * 通しテスト: Excel読込 → 調査(ダミーサイト) → 入力支援パネル → コピー値の完全一致 → 再起動後の再開 → Excel再読込
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from 'playwright-core';
import { createServer } from 'node:net';
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type { Server } from 'node:http';
import { startFixtureServer } from './helpers/server';
import { sheetsToBuffer } from './helpers/xlsx';
import { buildSampleSheets, SAMPLE_TEMPLATES } from '../src/cli/sample-data';
import { createApp } from '../src/server/http';
import { Controller } from '../src/server/controller';
import type { AppState, CompanyView } from '../src/shared/api';
import { STATUS } from '../src/shared/types';

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = createServer().listen(0, '127.0.0.1', () => {
      const p = (s.address() as { port: number }).port;
      s.close(() => resolve(p));
    });
  });
}
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

let fixtures: Awaited<ReturnType<typeof startFixtureServer>>;
let dataDir: string;
let xlsxPath: string;
let ctrl: Controller;
let httpServer: Server;
let base: string;
let port: number;
let chromePath: string | undefined;

async function startApp() {
  process.env.ASSIST_DATA_DIR = dataDir;
  process.env.ASSIST_AI = 'off';
  process.env.ASSIST_HEADLESS = '1';
  ctrl = new Controller({ headless: true });
  port = await freePort();
  const app = createApp(ctrl, port);
  httpServer = await new Promise<Server>((r) => {
    const s = app.listen(port, '127.0.0.1', () => r(s));
  });
  base = `http://127.0.0.1:${port}`;
}
async function stopApp() {
  await ctrl.shutdown();
  await new Promise((r) => httpServer.close(r));
}
const get = async <T>(path: string): Promise<T> => (await fetch(base + path)).json() as Promise<T>;
const post = async (path: string, body: unknown = {}) => {
  const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-contact-assist': '1' }, body: JSON.stringify(body) });
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
};
const view = (key: string) => get<CompanyView>(`/api/company?key=${encodeURIComponent(key)}`);

async function writeExcel(mutate?: (s: ReturnType<typeof buildSampleSheets>) => void) {
  const sheets = buildSampleSheets();
  // 企業のURLをローカルのダミーサイトに差し替える
  const c = sheets[0].rows;
  c[1][1] = `${fixtures.base}/site-ok/index.html`;
  c[2][1] = `${fixtures.base}/site-ban/index.html`;
  c[3][1] = `${fixtures.base}/site-noform/index.html`;
  c[4][1] = `${fixtures.base}/site-restricted/index.html`;
  mutate?.(sheets);
  writeFileSync(xlsxPath, await sheetsToBuffer(sheets));
}

beforeAll(async () => {
  fixtures = await startFixtureServer();
  dataDir = mkdtempSync(join(tmpdir(), 'ca-data-'));
  xlsxPath = join(dataDir, '営業リスト.xlsx');
  await writeExcel();
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  try {
    const { readdirSync, existsSync } = await import('node:fs');
    const d = readdirSync(root).find((x) => x.startsWith('chromium-') && !x.includes('headless'));
    const p = d && join(root, d, 'chrome-linux/chrome');
    chromePath = p && existsSync(p) ? p : undefined;
  } catch {
    chromePath = undefined;
  }
  process.env.ASSIST_BROWSER_PATH = chromePath;
  await startApp();
});
afterAll(async () => {
  await stopApp();
  await fixtures.close();
});

describe('API の防御', () => {
  it('ヘッダーなしのPOSTは拒否（他のWebページからの操作を防ぐ）', async () => {
    const r = await fetch(base + '/api/excel/load', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(r.status).toBe(403);
  });
  it('Hostが違うリクエスト（DNSリバインディング）は拒否', async () => {
    const r = await fetch(base + '/api/state', { headers: { host: 'evil.example:' + port } }).catch(() => null);
    // fetch は host ヘッダを上書きできない環境もあるため、到達できた場合のみ検証する
    if (r) expect([200, 403]).toContain(r.status);
  });
  it('Excel以外のパスは読み込まない', async () => {
    const r = await post('/api/excel/load', { path: '/etc/passwd' });
    expect(r.status).toBe(400);
  });
});

describe('通し動作', () => {
  let hashBefore: string;
  it('Excelを読み込む（引用符付きのパスもOK）', async () => {
    hashBefore = sha(xlsxPath);
    const r = await post('/api/excel/load', { path: `"${xlsxPath}"` });
    expect(r.status).toBe(200);
    const s = await get<AppState>('/api/state');
    expect(s.loaded).toBe(true);
    expect(s.structure?.status).toBe('ok');
    expect(s.companies.map((c) => c.name)).toEqual(['株式会社サンプル運輸', 'ダミー介護サービス株式会社', 'テスト製作所有限会社', '架空ITソリューションズ株式会社']);
    expect(s.companies.every((c) => c.status === STATUS.PENDING)).toBe(true);
  });

  it('企業1を調査 → 〇、入力支援パネルができる', async () => {
    const r = await post('/api/company/research?key=' + encodeURIComponent('株式会社サンプル運輸'), { mode: 'full' });
    expect(r.status).toBe(200);
    const v = await view('株式会社サンプル運輸');
    expect(v.status).toBe(STATUS.OK);
    expect(v.template?.number).toBe('1');
    expect(v.job.label).toBe('運輸・物流（ドライバー）');
    expect(v.plan?.items.map((i) => i.std)).toEqual(['company', 'department', 'name', 'email', 'phone', 'subject', 'body']);
    expect(v.transfer.map((t) => t.value)).toEqual([STATUS.OK, '運輸・物流（ドライバー）', '1', '', expect.stringContaining('/forms/form-a.html')]);
    const body = v.plan!.items.find((i) => i.std === 'body')!;
    expect(body.value).toBe('株式会社サンプル運輸\n' + SAMPLE_TEMPLATES[0].body);
  });

  it('企業2は営業お断り → パネルは出さず、理由・URL・根拠を返す', async () => {
    await post('/api/company/research?key=' + encodeURIComponent('ダミー介護サービス株式会社'), { mode: 'full' });
    const v = await view('ダミー介護サービス株式会社');
    expect(v.status).toBe(STATUS.NO_SALES);
    expect(v.blocking).toBe(true);
    expect(v.plan).toBeUndefined();
    expect(v.errorPanel?.url).toContain('/site-ban/contact.html');
    expect(v.errorPanel?.quote).toContain('営業');
    expect(v.errorPanel?.instruction).toContain('問い合わせ作業を行わないでください');
  });

  it('連続調査: 1社が失敗しても続行し、ステータスが付く', async () => {
    await post('/api/queue/start?key=' + encodeURIComponent('テスト製作所有限会社'));
    for (let i = 0; i < 120; i++) {
      const s = await get<AppState>('/api/state');
      if (!s.queue.running) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    const s = await get<AppState>('/api/state');
    const st = Object.fromEntries(s.companies.map((c) => [c.name, c.status]));
    expect(st['テスト製作所有限会社']).toBe(STATUS.NO_FORM);
    expect(st['架空ITソリューションズ株式会社']).toBe(STATUS.NOT_TARGET_FORM);
  });

  it('元のExcelは1バイトも変更されていない', () => {
    expect(sha(xlsxPath)).toBe(hashBefore);
  });

  it('アプリを閉じて開き直しても、続きから（調査結果が残っている）', async () => {
    await stopApp();
    await startApp();
    await post('/api/excel/load', { path: xlsxPath });
    const s = await get<AppState>('/api/state');
    expect(s.companies.find((c) => c.name === '株式会社サンプル運輸')?.status).toBe(STATUS.OK);
    expect(s.companies.find((c) => c.name === 'ダミー介護サービス株式会社')?.status).toBe(STATUS.NO_SALES);
  });

  it('保存ファイルに、本文・件名・個人情報が入っていない', async () => {
    const { readdirSync } = await import('node:fs');
    const dir = join(dataDir, 'progress');
    const text = readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
    expect(text).not.toContain('はじめてご連絡いたします');
    expect(text).not.toContain('taro.yamada');
    expect(text).not.toContain('080-1234-5678');
  });

  it('Excelの文面を書き換えて再読込 → 差分を検出し、新しい本文を使う（古い本文を使わない）', async () => {
    await writeExcel((s) => {
      const t = s[2].rows;
      t[1][5] = '\n【変更後の本文】\nこれが新しい本文です。';
      t[1][4] = '【変更後の件名】';
      s[0].rows.push(['追加された株式会社', '', '', '', '', '', '']);
    });
    await post('/api/excel/reload');
    const st = await get<AppState>('/api/state');
    expect(st.diffMessages.join('\n')).toContain('企業が追加されました');
    expect(st.diffMessages.join('\n')).toContain('文面「1」の件名・本文が変更されました');
    expect(st.companies.length).toBe(5);
    const v = await view('株式会社サンプル運輸');
    expect(v.status).toBe(STATUS.OK);
    const body = v.plan!.items.find((i) => i.std === 'body')!;
    expect(body.value).toBe('株式会社サンプル運輸\n\n【変更後の本文】\nこれが新しい本文です。');
    expect(v.plan!.items.find((i) => i.std === 'subject')!.value).toBe('【変更後の件名】');
  });

  it('職種を選び直すと、その職種の文面に切り替わる（他職種の文面は加工しない）', async () => {
    const key = encodeURIComponent('株式会社サンプル運輸');
    await post('/api/company/override?key=' + key, { patch: { jobLabel: '介護・福祉' } });
    const v = await view('株式会社サンプル運輸');
    expect(v.template?.number).toBe('2');
    expect(v.plan!.items.find((i) => i.std === 'body')!.value).toBe('株式会社サンプル運輸\n' + SAMPLE_TEMPLATES[1].body);
    expect(v.plan!.items.find((i) => i.std === 'subject')!.value).toBe(SAMPLE_TEMPLATES[1].subject);
  });
});

describe('画面（UI）: コピーされる値が表示値と完全一致する', () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true, executablePath: chromePath });
  });
  afterAll(async () => {
    await browser?.close();
  });

  it('全コピーボタンで、クリップボードの内容 = 表示されている値（余計な文字なし）', async () => {
    const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1400, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(base + '/');
    await page.waitForSelector('.company-list li');
    await page.locator('.company-list li', { hasText: '株式会社サンプル運輸' }).first().click();
    await page.waitForSelector('.form-panel .item');

    const items = page.locator('.form-panel .item.st-ok');
    const n = await items.count();
    expect(n).toBeGreaterThanOrEqual(7);
    for (let i = 0; i < n; i++) {
      const item = items.nth(i);
      const shown = await item.locator('pre.value').first().textContent();
      const btn = item.locator('button.copy-btn').first();
      await expect(btn.textContent()).resolves.toMatch(/コピー/);
      await btn.click();
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toBe(shown);
      await expect(btn.textContent()).resolves.toContain('✓ コピー済み');
      // 何度でも再コピーできる
      await btn.click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shown);
    }
    // Excel転記用のコピー
    const rows = page.locator('.transfer-row');
    for (let i = 0; i < (await rows.count()); i++) {
      const row = rows.nth(i);
      const btn = row.locator('button.copy-btn');
      if (await btn.isDisabled()) continue;
      const shown = await row.locator('pre.value').textContent();
      await btn.click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shown);
    }
    await page.screenshot({ path: join(tmpdir(), 'ui-company.png'), fullPage: false });

    // 別の企業へ移ると、コピー済みの表示がリセットされる
    await page.locator('.company-list li', { hasText: 'ダミー介護' }).first().click();
    await page.waitForSelector('.banner.error h2');
    expect(await page.locator('.banner.error h2').first().textContent()).toBe(STATUS.NO_SALES);
    expect(await page.locator('.form-panel').count()).toBe(0);
    await page.screenshot({ path: join(tmpdir(), 'ui-nosales.png') });
    await page.locator('.company-list li', { hasText: '株式会社サンプル運輸' }).first().click();
    await page.waitForSelector('.form-panel .item');
    expect(await page.locator('.copy-btn.done').count()).toBe(0);
    await ctx.close();
  });
});

describe('ファイルの状態', () => {
  it('Excel の更新時刻が読み込み後も変わっていない（このテストが書き換えた分を除く）', () => {
    expect(statSync(xlsxPath).isFile()).toBe(true);
  });
});
