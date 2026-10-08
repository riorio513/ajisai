import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startFixtureServer } from './helpers/server';
import { launchTestBrowser } from './helpers/browser';
import { analyzeForms } from '../src/form-analyzer/analyze';
import type { BrowserSession, ReadOnlyPage } from '../src/browser/session';
import type { FormAnalysis, StdField } from '../src/shared/types';

let server: Awaited<ReturnType<typeof startFixtureServer>>;
let browser: BrowserSession;
let page: ReadOnlyPage;

beforeAll(async () => {
  server = await startFixtureServer();
  browser = await launchTestBrowser();
  page = await browser.newPage();
});
afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function analyze(path: string): Promise<FormAnalysis> {
  const load = await page.open(server.base + path);
  expect(load.ok).toBe(true);
  await page.scroll();
  const raw = await page.readForms();
  const a = analyzeForms(raw);
  expect(a).not.toBeNull();
  return a!;
}

const stds = (a: FormAnalysis) => a.fields.map((f) => f.std);
const field = (a: FormAnalysis, std: StdField) => a.fields.find((f) => f.std === std)!;

describe('フォームA: 氏名一体型・電話ハイフンなし', () => {
  it('項目を表示順に認識し、隠しフィールドを除く', async () => {
    const a = await analyze('/forms/form-a.html');
    expect(stds(a)).toEqual(['company', 'department', 'name', 'email', 'phone', 'subject', 'body']);
    // hidden / display:none / 画面外のおとり欄は出てこない
    expect(a.fields.some((f) => /csrf|website_url|hp_trap/.test(f.raw.name))).toBe(false);
  });
  it('必須・任意', async () => {
    const a = await analyze('/forms/form-a.html');
    expect(a.fields.map((f) => f.conditions.required)).toEqual([true, 'unknown', true, true, true, 'unknown', true]);
  });
  it('入力条件: 半角数字・ハイフンなし / 文字数上限', async () => {
    const a = await analyze('/forms/form-a.html');
    const tel = field(a, 'phone');
    expect(tel.conditions.width).toBe('half');
    expect(tel.conditions.hyphen).toBe('without');
    expect(a.bodyLimit.limit).toBe(1000);
    expect(a.subjectLimit.limit).toBe(100);
  });
});

describe('フォームB: 姓名分割・電話3分割・確認用メール', () => {
  it('分割欄を識別する', async () => {
    const a = await analyze('/forms/form-b.html');
    expect(stds(a)).toEqual(['company', 'lastName', 'firstName', 'email', 'emailConfirm', 'phone1', 'phone2', 'phone3', 'position', 'subject', 'body']);
    expect(field(a, 'position').conditions.required).toBe(false);
    expect(a.captcha.present).toBe(true);
    expect(a.captcha.kinds).toContain('reCAPTCHA');
  });
});

describe('フォームC: カタカナ必須・郵便2分割・select', () => {
  it('項目と条件', async () => {
    const a = await analyze('/forms/form-c.html');
    expect(stds(a)).toEqual(['company', 'name', 'kana', 'postal1', 'postal2', 'prefecture', 'address', 'phone', 'email', 'body']);
    const kana = field(a, 'kana');
    expect(kana.conditions.kanaScript).toBe('katakana');
    expect(field(a, 'prefecture').control).toBe('select');
    expect(field(a, 'prefecture').raw.options.map((o) => o.label)).toContain('東京都');
    expect(field(a, 'phone').conditions.hyphen).toBe('with');
  });
});

describe('フォームD: 文字数制限500', () => {
  it('maxlength と 0/500 表示', async () => {
    const a = await analyze('/forms/form-d.html');
    expect(a.bodyLimit.limit).toBe(500);
    expect(stds(a)).toEqual(['company', 'name', 'email', 'body']);
  });
});

describe('フォームF: select / radio / checkbox / file', () => {
  it('選択系の入力欄とグループ化', async () => {
    const a = await analyze('/forms/form-f.html');
    const radio = a.fields.find((f) => f.control === 'radio')!;
    expect(radio.raw.options.map((o) => o.label)).toEqual(['サービスについて', '採用について', 'その他']);
    expect(radio.std).toBe('inquiryType');
    expect(radio.conditions.required).toBe(true);
    const boxes = a.fields.find((f) => f.control === 'checkbox' && f.raw.name === 'svc[]')!;
    expect(boxes.raw.options.length).toBe(2);
    expect(a.fields.find((f) => f.std === 'consent')).toBeTruthy();
    expect(a.fields.find((f) => f.control === 'file')).toBeTruthy();
    expect(a.fields.find((f) => f.std === 'prefecture')!.control).toBe('select');
  });
});

describe('iframe / Shadow DOM', () => {
  it('iframe 内のフォームも読める', async () => {
    const a = await analyze('/forms/form-g-iframe.html');
    expect(a.isIframe).toBe(true);
    expect(stds(a)).toContain('email');
    expect(a.fields.length).toBeGreaterThanOrEqual(7);
  });
  it('Shadow DOM 内のフォームも読める', async () => {
    const a = await analyze('/forms/form-i-shadow.html');
    expect(stds(a)).toEqual(['name', 'email', 'body']);
    expect(a.fields[0].raw.inShadow).toBe(true);
  });
});

describe('不明な入力項目', () => {
  it('分類できない欄は unknown のまま（推測しない）', async () => {
    const a = await analyze('/forms/form-j-unknown.html');
    const q = a.fields.find((f) => f.raw.name === 'qty')!;
    expect(q.std).toBe('unknown');
    expect(q.conditions.required).toBe(true);
  });
});
