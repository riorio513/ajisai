import { describe, it, expect } from 'vitest';
import { sampleModel, modelFrom } from './helpers/xlsx';
import { buildSampleSheets, SAMPLE_COMPANIES, SAMPLE_TEMPLATES } from '../src/cli/sample-data';

describe('Excel構造の自動認識（ベース）', () => {
  it('3つの役割を特定し、企業・文面・問い合わせ情報を取り出す', async () => {
    const m = await sampleModel();
    expect(m.structure.status).toBe('ok');
    expect(m.companies.map((c) => c.name)).toEqual(SAMPLE_COMPANIES.map((c) => c[0]));
    expect(m.templates.length).toBe(SAMPLE_TEMPLATES.length);
    expect(m.master?.values.companyName).toBe('採用支援テスト株式会社');
    expect(m.master?.values.email).toBe('taro.yamada@example.co.jp');
    expect(m.master?.conflicts).toEqual([]);
    expect(m.jobs.map((j) => j.label)).toEqual(SAMPLE_TEMPLATES.map((t) => t.job));
  });
  it('文面の件名・本文は原文のまま（改行・前後の空白を含む）', async () => {
    const m = await sampleModel();
    for (const s of SAMPLE_TEMPLATES) {
      const t = m.templates.find((x) => x.number === String(s.no))!;
      expect(t.subject).toBe(s.subject);
      expect(t.body).toBe(s.body);
    }
    // 本文先頭の改行が消えていない
    expect(m.templates[0].body.startsWith('\n')).toBe(true);
  });
});

describe('Excel変更への追従', () => {
  const variants: [string, Parameters<typeof sampleModel>[0]][] = [
    ['シート順変更', { sheetOrder: ['templates', 'company', 'master'] }],
    ['シート順変更2', { sheetOrder: ['master', 'templates', 'company'] }],
    ['シート名変更', { names: { company: 'Sheet1', master: 'Sheet2', templates: 'Sheet3' } }],
    ['見出しの別名', { aliases: true }],
    ['ヘッダー位置変更', { headerOffset: 4 }],
    ['空白列追加', { leadingBlankCols: 2 }],
    ['空白行追加', { blankRows: true }],
    ['列追加', { extraColumns: true }],
    ['列順変更(逆順)', { reverseColumns: true }],
    ['文面追加', { extraTemplates: 15 }],
    ['問い合わせ情報が横並び', { masterLayout: 'horizontal' }],
    ['文面が横並び(転置)', { templateOrientation: 'columns' }],
    ['全部入り', { aliases: true, headerOffset: 3, leadingBlankCols: 1, blankRows: true, extraColumns: true, reverseColumns: true, extraTemplates: 5, sheetOrder: ['templates', 'master', 'company'], names: { company: '1', master: '2', templates: '3' } }],
  ];
  for (const [name, o] of variants) {
    it(name, async () => {
      const m = await sampleModel(o);
      expect(m.structure.problems).toEqual([]);
      expect(m.structure.status).toBe('ok');
      expect(m.companies.map((c) => c.name)).toEqual(SAMPLE_COMPANIES.map((c) => c[0]));
      expect(m.templates.length).toBe(SAMPLE_TEMPLATES.length + (o?.extraTemplates ?? 0));
      expect(m.master?.values.phone).toBe('080-1234-5678');
      // 原文が変わっていない
      const t1 = m.templates.find((t) => t.job === SAMPLE_TEMPLATES[0].job)!;
      expect(t1.body).toBe(SAMPLE_TEMPLATES[0].body);
      expect(t1.subject).toBe(SAMPLE_TEMPLATES[0].subject);
    });
  }
  it('企業が多数でも順番どおり', async () => {
    const m = await sampleModel({ companyCount: 120 });
    expect(m.companies.length).toBe(120);
    expect(m.companies.map((c) => c.order)).toEqual([...Array(120).keys()]);
  });
});

describe('構造が決められない場合は止まる', () => {
  it('文面シートが無い', async () => {
    const sheets = buildSampleSheets().filter((s) => s.name !== '文面');
    const m = await modelFrom(sheets);
    expect(m.structure.status).toBe('needs-confirmation');
    expect(m.structure.problems.some((p) => p.role === 'templates')).toBe(true);
  });
  it('企業一覧が2枚あると決められない', async () => {
    const s = buildSampleSheets();
    const dup = { ...s[0], name: '企業一覧_旧' };
    const m = await modelFrom([...s, dup]);
    expect(m.structure.status).toBe('needs-confirmation');
    expect(m.structure.problems.find((p) => p.role === 'company')?.candidates?.length).toBe(2);
  });
  it('意味の取れないExcel', async () => {
    const m = await modelFrom([{ name: 'a', rows: [['x', 'y'], ['1', '2']] }]);
    expect(m.structure.status).toBe('needs-confirmation');
    expect(m.companies).toEqual([]);
  });
});

describe('データ品質チェック', () => {
  it('重複・空・URL異常などを警告として検出する', async () => {
    const s = buildSampleSheets();
    const company = s[0];
    company.rows.push(['株式会社サンプル運輸', 'not a url', '', '', '', '', '']);
    company.rows.push([null, 'https://example.com', '', '', '', '', '']);
    const tpl = s[2];
    tpl.rows.push([1, '運輸・物流（ドライバー）', '', '', '', '', ]);
    const m = await modelFrom(s);
    const codes = m.quality.map((q) => q.code);
    expect(codes).toContain('company-duplicate');
    expect(codes).toContain('company-name-empty');
    expect(codes).toContain('url-format');
    expect(codes).toContain('template-number-duplicate');
    expect(codes).toContain('template-subject-missing');
    expect(codes).toContain('template-body-missing');
    expect(codes).toContain('template-job-duplicate');
    // 全体は止まらない
    expect(m.companies.length).toBeGreaterThan(0);
  });
});

describe('問い合わせ情報の矛盾検出', () => {
  it('電話番号が2か所で異なる → 矛盾として停止（勝手にどちらも採用しない）', async () => {
    const m = await sampleModel({ phoneConflict: true });
    const c = m.master!.conflicts.find((x) => x.fieldGroup === 'field:phone');
    expect(c).toBeTruthy();
    expect(c!.candidates.map((x) => x.display).sort()).toEqual(['080-1234-5678', '090-9999-0000']);
    expect(m.master!.values.phone).toBeUndefined();
  });
  it('ユーザーの選択で解決できる（Excelは変更しない）', async () => {
    const first = await sampleModel({ phoneConflict: true });
    const conf = first.master!.conflicts[0];
    const pick = conf.candidates.find((c) => c.display === '090-9999-0000')!;
    const m = await sampleModel({ phoneConflict: true }, { masterOverrides: { [conf.id]: pick.id } });
    expect(m.master!.conflicts).toEqual([]);
    expect(m.master!.values.phone).toBe('090-9999-0000');
  });
  it('氏名と姓名が食い違う → 矛盾', async () => {
    const m = await sampleModel({ nameConflict: true });
    expect(m.master!.conflicts.some((c) => c.fieldGroup === 'cross:name')).toBe(true);
  });
  it('ハイフン・全角半角の違いだけなら矛盾ではない', async () => {
    const s = buildSampleSheets();
    s[1].rows.push(['携帯番号', '０８０１２３４５６７８']);
    const m = await modelFrom(s);
    expect(m.master!.conflicts).toEqual([]);
    expect(m.master!.values.phone).toBe('080-1234-5678');
  });
  it('数値セルで先頭0が欠けた電話番号は確認が必要', async () => {
    const m = await sampleModel({ numericPhone: true });
    expect(m.master!.conflicts.some((c) => c.fieldGroup === 'zero:phone')).toBe(true);
  });
});
