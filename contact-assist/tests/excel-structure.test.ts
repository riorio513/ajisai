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

describe('列の削除・文面番号の変更・問い合わせ情報の変更・職種の増減', () => {
  it('任意の列を削除しても動く（業界/memo/文面番号/判定、想定ターゲット/採用単価）', async () => {
    const s = buildSampleSheets();
    const drop = (rows: (string | number | null)[][], idxs: number[]) => rows.map((r) => r.filter((_, i) => !idxs.includes(i)));
    s[0].rows = drop(s[0].rows, [2, 4, 5, 6]); // 企業名, 企業HP, 職種
    s[2].rows = drop(s[2].rows, [2, 3]); // No, 職種, 件名, 本文
    const m = await modelFrom(s);
    expect(m.structure.status).toBe('ok');
    expect(m.companies.length).toBe(SAMPLE_COMPANIES.length);
    expect(m.templates.length).toBe(SAMPLE_TEMPLATES.length);
    expect(m.templates[0].target).toBe('');
  });
  it('文面番号を付け替えても、その時点のExcelの番号が使われる', async () => {
    const s = buildSampleSheets();
    s[2].rows.slice(1).forEach((r, i) => (r[0] = `T-${String(i + 1).padStart(2, '0')}`));
    const m = await modelFrom(s);
    expect(m.templates.map((t) => t.number)).toEqual(['T-01', 'T-02', 'T-03', 'T-04', 'T-05']);
    expect(m.templates[0].id).toBe('T-01');
  });
  it('問い合わせ情報の変更（送信者・電話・メール）が反映される', async () => {
    const s = buildSampleSheets();
    for (const r of s[1].rows) {
      if (r[0] === '電話番号') r[1] = '090-1111-2222';
      if (r[0] === 'メールアドレス') r[1] = 'new@example.org';
      if (r[0] === '氏名') r[1] = '佐藤 花子';
      if (r[0] === '姓') r[1] = '佐藤';
      if (r[0] === '名') r[1] = '花子';
    }
    const m = await modelFrom(s);
    expect(m.master!.values.phone).toBe('090-1111-2222');
    expect(m.master!.values.email).toBe('new@example.org');
    expect(m.master!.values.fullName).toBe('佐藤 花子');
    expect(m.master!.conflicts).toEqual([]);
  });
  it('項目の追加・削除（役職を入れる / 部署を消す）', async () => {
    const s = buildSampleSheets();
    for (const r of s[1].rows) if (r[0] === '役職') r[1] = '部長';
    s[1].rows = s[1].rows.filter((r) => r[0] !== '部署');
    const m = await modelFrom(s);
    expect(m.master!.values.position).toBe('部長');
    expect(m.master!.values.department).toBeUndefined();
  });
  it('職種が18→30種類に増えても使える / 職種を減らしても使える', async () => {
    const m30 = await sampleModel({ extraTemplates: 25 });
    expect(m30.jobs.length).toBe(30);
    const s = buildSampleSheets();
    s[2].rows = s[2].rows.slice(0, 3);
    const m2 = await modelFrom(s);
    expect(m2.jobs.map((j) => j.label)).toEqual([SAMPLE_TEMPLATES[0].job, SAMPLE_TEMPLATES[1].job]);
  });
  it('企業のURLは原文のまま', async () => {
    const m = await sampleModel();
    expect(m.companies.map((c) => c.url)).toEqual(SAMPLE_COMPANIES.map((c) => c[1]));
  });
});

describe('問い合わせ情報の書き方いろいろ', () => {
  it('電話番号・郵便番号が複数セルに分かれていれば、明示された分割値として読む', async () => {
    const s = buildSampleSheets();
    for (const r of s[1].rows) {
      if (r[0] === '電話番号') {
        r[1] = '080';
        r.push('1234', '5678');
      }
      if (r[0] === '郵便番号') {
        r[1] = '160';
        r.push('0023');
      }
    }
    const m = await modelFrom(s);
    expect(m.master!.values).toMatchObject({ phone1: '080', phone2: '1234', phone3: '5678', postal1: '160', postal2: '0023' });
    expect(m.master!.values.phone).toBeUndefined();
    expect(m.master!.conflicts).toEqual([]);
  });
  it('ラベルの末尾にコロンや必須表記があっても読める', async () => {
    const s = buildSampleSheets();
    s[1].rows = s[1].rows.map((r) => (typeof r[0] === 'string' && r[0] !== '項目' ? [`${r[0]}：（必須）`, r[1]] : r));
    const m = await modelFrom(s);
    expect(m.master!.values.email).toBe('taro.yamada@example.co.jp');
    expect(m.master!.values.companyName).toBe('採用支援テスト株式会社');
  });
  it('備考欄が右にあっても、値を取り違えない', async () => {
    const s = buildSampleSheets();
    s[1].rows = s[1].rows.map((r) => (r[0] === '電話番号' ? [r[0], r[1], '携帯'] : r));
    const m = await modelFrom(s);
    expect(m.master!.values.phone).toBe('080-1234-5678');
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
