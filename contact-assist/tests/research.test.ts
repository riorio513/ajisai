import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startFixtureServer } from './helpers/server';
import { launchTestBrowser } from './helpers/browser';
import { researchCompany } from '../src/research/pipeline';
import { NullAIProvider } from '../src/ai';
import { LlmProvider } from '../src/ai/llm-provider';
import { jobOptions } from '../src/templates/extract';
import { SAMPLE_TEMPLATES } from '../src/cli/sample-data';
import { STATUS } from '../src/shared/types';
import type { BrowserSession, ReadOnlyPage } from '../src/browser/session';
import type { Company, Template } from '../src/shared/types';

let server: Awaited<ReturnType<typeof startFixtureServer>>;
let browser: BrowserSession;
let page: ReadOnlyPage;

const templates: Template[] = SAMPLE_TEMPLATES.map((t, i) => ({
  id: String(t.no), excelRow: i + 2, where: `${i + 2}行目`, number: String(t.no), job: t.job, target: t.target, price: t.price, subject: t.subject, body: t.body,
}));
const jobs = jobOptions(templates);

const company = (name: string, url: string): Company => ({
  key: name, order: 0, excelRow: 2, name, url, industry: '', excelJob: '', excelMemo: '', excelTemplateNo: '', excelJudgement: '',
});

beforeAll(async () => {
  server = await startFixtureServer();
  browser = await launchTestBrowser();
  page = await browser.newPage();
});
afterAll(async () => {
  await browser?.close();
  await server?.close();
});

const deps = () => ({ page, ai: new NullAIProvider(), delayMs: 0, maxPages: 12 });

describe('企業調査パイプライン（ダミーサイト）', () => {
  it('通常のサイト: フォーム発見・営業禁止なし・職種を採用ページから選ぶ', async () => {
    const r = await researchCompany(deps(), company('株式会社サンプル運輸', server.base + '/site-ok/index.html'), jobs);
    expect(r.code).toBe(STATUS.OK);
    expect(r.contactUrl).toContain('/forms/form-a.html');
    expect(r.site?.verified).toBe(true);
    expect(r.solicitation.verdict).toBe('none');
    expect(r.solicitation.checkedUrls.length).toBeGreaterThan(2);
    // 採用ページ「ドライバー（中型・大型）」
    expect(r.job.label).toBe('運輸・物流（ドライバー）');
    expect(r.job.by).toBe('rule');
    expect(r.job.templateIds).toEqual(['1']);
    expect(r.evidence.some((e) => e.kind === '職種' || e.kind === '近似職種')).toBe(true);
    expect(r.evidence.every((e) => e.url && e.at && e.snippet)).toBe(true);
    expect(r.form?.fields.length).toBe(7);
    // 「営業に関するお問い合わせ」という案内は営業禁止ではない
    expect(r.solicitation.verdict).not.toBe('banned');
  });

  it('営業禁止サイト: 案内ページの文言から営業お断りと判定し、根拠を返す', async () => {
    const r = await researchCompany(deps(), company('ダミー介護サービス株式会社', server.base + '/site-ban/index.html'), jobs);
    expect(r.code).toBe(STATUS.NO_SALES);
    expect(r.solicitation.verdict).toBe('banned');
    const ev = r.evidence.find((e) => e.kind === '営業禁止')!;
    expect(ev.snippet).toContain('営業');
    expect(ev.url).toContain('/site-ban/contact.html');
  });

  it('フォームが無いサイト', async () => {
    const r = await researchCompany(deps(), company('テスト製作所有限会社', server.base + '/site-noform/index.html'), jobs);
    expect(r.code).toBe(STATUS.NO_FORM);
  });

  it('特定の人専用のフォームだけ → 対象外フォーム', async () => {
    const r = await researchCompany(deps(), company('サンプルクリニック', server.base + '/site-restricted/index.html'), jobs);
    expect(r.code).toBe(STATUS.NOT_TARGET_FORM);
    expect(r.contactCandidates[0].eligibility).toBe('restricted');
  });

  it('アクセスできないURL → アクセス不可（他の社には影響しない）', async () => {
    const r = await researchCompany(deps(), company('存在しない株式会社', 'http://127.0.0.1:1/'), jobs);
    expect([STATUS.ACCESS, STATUS.COMPANY_UNCLEAR]).toContain(r.code);
  });

  it('URLが無く検索もできない → 企業特定要確認（別企業を採用しない）', async () => {
    const r = await researchCompany({ ...deps(), searchEngines: [{ name: 'ダミー検索', url: (q) => `${server.base}/site-noform/company.html?q=${encodeURIComponent(q)}`, host: /127\.0\.0\.1$/ }] }, company('どこにもない株式会社', ''), jobs);
    expect(r.code).toBe(STATUS.COMPANY_UNCLEAR);
  });

  it('調査はフォームへ何も書き込まない（POSTが発生しない）', async () => {
    expect(server.posts).toEqual([]);
  });
});

describe('AIの結果は検証してから使う', () => {
  it('職種: 候補にないIDを返されても採用しない', async () => {
    const ai = new LlmProvider('fake', async () => '{"jobId":"j99","exact":true,"reason":"x"}');
    const r = await ai.pickJob({ company: 'a', evidence: [], jobs: [{ id: 'j0', label: '介護' }] });
    expect(r.jobId).toBeNull();
  });
  it('営業禁止: 原文にない根拠を捏造したAI回答は禁止と認めない', async () => {
    const ai = new LlmProvider('fake', async () => '{"verdict":"banned","passage":0,"quote":"営業は絶対に禁止です","reason":"x"}');
    const r = await ai.judgeSolicitation({ company: 'a', passages: [{ url: 'u', text: 'お問い合わせはこちらです。' }] });
    expect(r.verdict).toBe('unclear');
  });
  it('営業禁止: 原文にある根拠なら禁止', async () => {
    const ai = new LlmProvider('fake', async () => 'こちらです```json\n{"verdict":"banned","passage":0,"quote":"セールスはご遠慮ください","reason":"x"}\n```');
    const r = await ai.judgeSolicitation({ company: 'a', passages: [{ url: 'u', text: '恐れ入りますがセールスはご遠慮ください。' }] });
    expect(r.verdict).toBe('banned');
    expect(r.url).toBe('u');
  });
  it('項目分類: 許可リスト外の値は採用しない', async () => {
    const ai = new LlmProvider('fake', async () => '{"std":"creditCard","reason":"x"}');
    const r = await ai.classifyField({ control: 'text', label: 'a', name: '', id: '', placeholder: '', type: 'text', hint: '', options: [] });
    expect(r.std).toBeNull();
  });
});
