import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startFixtureServer } from './helpers/server';
import { launchTestBrowser } from './helpers/browser';
import { sampleModel } from './helpers/xlsx';
import { analyzeForms } from '../src/form-analyzer/analyze';
import { buildPlan } from '../src/clipboard/plan';
import type { BrowserSession, ReadOnlyPage } from '../src/browser/session';
import type { FormAnalysis, InputPlan, MasterData, Template } from '../src/shared/types';
import { STATUS } from '../src/shared/types';
import { SAMPLE_TEMPLATES } from '../src/cli/sample-data';

let server: Awaited<ReturnType<typeof startFixtureServer>>;
let browser: BrowserSession;
let page: ReadOnlyPage;
let master: MasterData;
let template: Template;
const COMPANY = '株式会社サンプル運輸';

beforeAll(async () => {
  server = await startFixtureServer();
  browser = await launchTestBrowser();
  page = await browser.newPage();
  const m = await sampleModel();
  master = m.master!;
  template = m.templates[0];
});
afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function analysisOf(path: string): Promise<FormAnalysis> {
  await page.open(server.base + path);
  const a = analyzeForms(await page.readForms());
  expect(a).not.toBeNull();
  return a!;
}
const plan = async (path: string, over: Partial<{ master: MasterData; template: Template | null }> = {}): Promise<InputPlan> =>
  buildPlan({ analysis: await analysisOf(path), master: over.master ?? master, companyName: COMPANY, template: over.template === undefined ? template : over.template });
const byStd = (p: InputPlan, std: string) => p.items.filter((i) => i.std === std);

describe('入力支援パネル: フォームA（氏名一体・電話ハイフンなし）', () => {
  it('各欄の貼り付け値が確定し、表示順がフォームと一致する', async () => {
    const p = await plan('/forms/form-a.html');
    expect(p.items.map((i) => i.std)).toEqual(['company', 'department', 'name', 'email', 'phone', 'subject', 'body']);
    expect(p.errors).toEqual([]);
    const val = (std: string) => byStd(p, std)[0].value;
    expect(val('company')).toBe('採用支援テスト株式会社');
    expect(val('department')).toBe('採用支援事業部');
    expect(val('name')).toBe('山田 太郎');
    expect(val('email')).toBe('taro.yamada@example.co.jp');
    expect(val('phone')).toBe('08012345678');
    expect(val('subject')).toBe(template.subject);
    expect(byStd(p, 'phone')[0].note).toContain('ハイフンなし');
  });
  it('本文 = 企業名 + 改行1文字 + Excel本文原文（先頭の改行も保持）', async () => {
    const p = await plan('/forms/form-a.html');
    const body = byStd(p, 'body')[0];
    expect(body.value).toBe(COMPANY + '\n' + SAMPLE_TEMPLATES[0].body);
    expect(body.value!.startsWith(COMPANY + '\n\n')).toBe(true); // 空行が入る（元本文が改行始まりのため）
    expect(body.charCheck).toMatchObject({ count: body.value!.length, limit: 1000, ok: true });
    expect(p.captcha.present).toBe(false);
  });
  it('必須/任意の判定が反映される', async () => {
    const p = await plan('/forms/form-a.html');
    expect(p.items.map((i) => i.required)).toEqual([true, 'unknown', true, true, true, 'unknown', true]);
  });
});

describe('入力支援パネル: フォームB（姓名・電話3分割）', () => {
  it('分割欄を個別の値にする', async () => {
    const p = await plan('/forms/form-b.html');
    expect(p.items.map((i) => i.std)).toEqual(['company', 'lastName', 'firstName', 'email', 'emailConfirm', 'phone1', 'phone2', 'phone3', 'position', 'subject', 'body']);
    expect([byStd(p, 'lastName')[0].value, byStd(p, 'firstName')[0].value]).toEqual(['山田', '太郎']);
    expect([byStd(p, 'phone1')[0].value, byStd(p, 'phone2')[0].value, byStd(p, 'phone3')[0].value]).toEqual(['080', '1234', '5678']);
    // 確認用メールも独立した入力欄
    expect(byStd(p, 'email')[0].value).toBe(byStd(p, 'emailConfirm')[0].value);
    // 役職データなし（任意）: 項目なし・エラーにしない
    expect(byStd(p, 'position')[0].status).toBe('missing');
    expect(byStd(p, 'position')[0].note).toBe('項目なし：役職');
    expect(p.errors).toEqual([]);
    expect(p.captcha.present).toBe(true);
  });
});

describe('入力支援パネル: フォームC（カタカナ・郵便2分割・select）', () => {
  it('かな変換・郵便番号・住所・都道府県', async () => {
    const p = await plan('/forms/form-c.html');
    // フォームが「全角カタカナ」を指示 → 区切りの空白も全角にそろえる（機械的変換）
    expect(byStd(p, 'kana')[0].value).toBe('ヤマダ\u3000タロウ');
    expect([byStd(p, 'postal1')[0].value, byStd(p, 'postal2')[0].value]).toEqual(['160', '0023']);
    const pref = byStd(p, 'prefecture')[0];
    expect(pref.status).toBe('choose');
    expect(pref.choice?.action).toBe('「東京都」を選択');
    // 都道府県の欄が別にあるので、住所欄は都道府県を除いた部分
    expect(byStd(p, 'address')[0].value).toBe('新宿区西新宿1-2-3 テストビル5F');
    // 入力例が 03-1234-5678 → ハイフンあり
    expect(byStd(p, 'phone')[0].value).toBe('080-1234-5678');
  });
  it('ひらがなの元データでもカタカナ欄へ機械変換する', async () => {
    const m = structuredClone(master);
    m.values.fullKana = 'やまだ たろう';
    const p = await plan('/forms/form-c.html', { master: m });
    // フォームが「全角カタカナ」を指示 → 区切りの空白も全角にそろえる（機械的変換）
    expect(byStd(p, 'kana')[0].value).toBe('ヤマダ\u3000タロウ');
  });
});

describe('入力支援パネル: 文字数制限', () => {
  it('本文が上限(500)を超えると「文字数制限」エラー。短縮・要約はしない', async () => {
    const long: Template = { ...template, body: 'あ'.repeat(600) };
    const p = await plan('/forms/form-d.html', { template: long });
    const body = byStd(p, 'body')[0];
    expect(body.charCheck?.ok).toBe(false);
    expect(body.value).toBe(COMPANY + '\n' + 'あ'.repeat(600)); // 短縮されていない
    expect(p.errors.map((e) => e.code)).toContain(STATUS.CHAR_LIMIT);
  });
  it('上限内なら入力可能', async () => {
    const p = await plan('/forms/form-d.html');
    expect(byStd(p, 'body')[0].charCheck).toMatchObject({ limit: 500, ok: true });
    expect(p.errors).toEqual([]);
  });
});

describe('入力支援パネル: select / radio / checkbox', () => {
  it('選択操作は指示のみ（アプリは選択しない）', async () => {
    const p = await plan('/forms/form-f.html');
    const kind = byStd(p, 'inquiryType')[0];
    expect(kind.control).toBe('radio');
    expect(kind.choice?.action).toBe('「その他」を選択');
    expect(byStd(p, 'prefecture')[0].choice?.action).toBe('「東京都」を選択');
    expect(byStd(p, 'consent')[0].status).toBe('choose');
    const svc = p.items.find((i) => i.control === 'checkbox' && i.std === 'unknown')!;
    expect(svc.choice?.action).toBe('選択要確認');
    expect(p.items.find((i) => i.control === 'file')!.status).toBe('info');
  });
});

describe('入力支援パネル: 不足・不明・分割不能', () => {
  it('必須のデータが無ければ「入力必須データ不足」', async () => {
    const m = structuredClone(master);
    delete m.values.phone;
    const p = await plan('/forms/form-a.html', { master: m });
    expect(p.errors.map((e) => e.code)).toContain(STATUS.DATA_MISSING);
    expect(byStd(p, 'phone')[0].status).toBe('missing');
  });
  it('元データに無い役職・部署を勝手に作らない', async () => {
    const m = structuredClone(master);
    delete m.values.department;
    const p = await plan('/forms/form-a.html', { master: m });
    expect(byStd(p, 'department')[0].value).toBeUndefined();
    expect(byStd(p, 'department')[0].note).toBe('項目なし：部署');
  });
  it('不明な必須入力欄はフォーム解析要確認', async () => {
    const p = await plan('/forms/form-j-unknown.html');
    const q = p.items.find((i) => i.std === 'unknown')!;
    expect(q.status).toBe('unknown-field');
    expect(q.value).toBeUndefined();
    expect(p.errors.map((e) => e.code)).toContain(STATUS.FORM_UNCLEAR);
  });
  it('電話番号の区切りを確定できなければ「電話番号分割要確認」', async () => {
    const m = structuredClone(master);
    m.values.phone = '0422123456';
    m.variants.phone = ['0422123456'];
    const p = await plan('/forms/form-b.html', { master: m });
    expect(p.errors.map((e) => e.code)).toContain(STATUS.PHONE_SPLIT);
    expect(byStd(p, 'phone1')[0].status).toBe('need-confirm');
  });
  it('氏名の姓名境界を確定できなければ「氏名分割要確認」', async () => {
    const m = structuredClone(master);
    delete m.values.lastName;
    delete m.values.firstName;
    m.values.fullName = '名嘉眞要';
    const p = await plan('/forms/form-b.html', { master: m });
    expect(p.errors.map((e) => e.code)).toContain(STATUS.NAME_SPLIT);
  });
  it('住所の境界を確定できなければ「住所分割要確認」', async () => {
    const m = structuredClone(master);
    m.values.address = '神奈川県横浜市中区本町1-1';
    delete m.values.building;
    delete m.values.prefecture;
    const a = await analysisOf('/forms/form-c.html');
    // 市区町村の欄が別にあるフォームを模擬
    a.fields.find((f) => f.std === 'address')!.std = 'street';
    a.fields.splice(6, 0, { ...a.fields.find((f) => f.std === 'street')!, std: 'city', displayLabel: '市区町村' });
    const p = buildPlan({ analysis: a, master: m, companyName: COMPANY, template });
    expect(p.errors.map((e) => e.code)).toContain(STATUS.ADDRESS_SPLIT);
  });
});

describe('作業に関係ない項目は無視する（エラーにしない）', () => {
  it('「職種」と「確認したらチェック」は、必須でも無視して、エラーにならない', async () => {
    const p = await plan('/forms/form-k-ignore.html');
    const ignored = p.items.filter((i) => i.status === 'ignored').map((i) => i.label);
    expect(ignored.length).toBe(2);
    expect(ignored.join('')).toContain('職種');
    expect(ignored.join('')).toContain('確認');
    expect(p.errors).toEqual([]);
    expect(p.items.filter((i) => i.status === 'ignored').every((i) => i.value === undefined && !i.choice)).toBe(true);
    // 他の項目は通常どおり
    expect(byStd(p, 'company')[0].status).toBe('ok');
    expect(byStd(p, 'body')[0].status).toBe('ok');
  });
  it('利用者が「無視する」と決めた項目名も、エラーにしない', async () => {
    const a = await analysisOf('/forms/form-j-unknown.html');
    const before = buildPlan({ analysis: a, master, companyName: COMPANY, template });
    expect(before.errors.map((e) => e.code)).toContain(STATUS.FORM_UNCLEAR);
    const after = buildPlan({ analysis: a, master, companyName: COMPANY, template, ignore: ['ご利用台数'] });
    expect(after.errors).toEqual([]);
    expect(after.items.find((i) => i.label.includes('ご利用台数'))?.status).toBe('ignored');
  });
  it('メール等の分類済みの項目は、無視ルールの影響を受けない', async () => {
    const p = await plan('/forms/form-a.html');
    expect(p.items.filter((i) => i.status === 'ignored')).toEqual([]);
  });
});
