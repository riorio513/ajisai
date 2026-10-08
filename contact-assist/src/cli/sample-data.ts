/**
 * 動作確認・テスト用のダミーExcelの中身を作る。
 * 実在の会社・個人とは無関係の架空データ。アプリ本体はこの内容や構造に依存しない。
 */

export type Cell = string | number | null;
export interface SheetSpec {
  name: string;
  rows: Cell[][];
}

export interface SampleOptions {
  sheetOrder?: ('company' | 'master' | 'templates')[];
  names?: Partial<Record<'company' | 'master' | 'templates', string>>;
  /** 見出しの別名を使う（企業名→会社名 など） */
  aliases?: boolean;
  /** 先頭に余計な行（タイトル・注意書き）を入れる */
  headerOffset?: number;
  /** 見出しの前に空白列を入れる */
  leadingBlankCols?: number;
  /** データの途中に空行を入れる */
  blankRows?: boolean;
  /** 列を追加・並び替える */
  extraColumns?: boolean;
  reverseColumns?: boolean;
  extraTemplates?: number;
  masterLayout?: 'vertical' | 'horizontal';
  templateOrientation?: 'rows' | 'columns';
  /** 電話番号を2か所に別の値で書く */
  phoneConflict?: boolean;
  /** 氏名と姓・名を矛盾させる */
  nameConflict?: boolean;
  /** 電話番号を数値セルにする（先頭0欠落） */
  numericPhone?: boolean;
  companyCount?: number;
}

export const SAMPLE_COMPANIES: [string, string, string][] = [
  ['株式会社サンプル運輸', 'https://example.com/', '運送業'],
  ['ダミー介護サービス株式会社', 'https://example.org/', '介護'],
  ['テスト製作所有限会社', '', '製造業'],
  ['架空ITソリューションズ株式会社', 'https://example.net/', 'IT'],
];

export const SAMPLE_TEMPLATES: { no: number; job: string; target: string; price: string; subject: string; body: string }[] = [
  { no: 1, job: '運輸・物流（ドライバー）', target: '運送会社', price: '15万円', subject: '【ドライバー採用】ご担当者様へ', body: '\nご担当者様\n\nはじめてご連絡いたします。\nドライバー採用に関するご提案です。\n\nよろしくお願いいたします。' },
  { no: 2, job: '介護・福祉', target: '介護事業所', price: '12万円', subject: '【介護職採用のご案内】', body: 'ご担当者様\n介護職の採用についてご案内です。\n  インデント付きの行もあります。  \n以上' },
  { no: 3, job: '製造・工場', target: '工場', price: '10万円', subject: '製造スタッフ採用のご相談', body: '製造スタッフの採用に関するご相談です。\n\n　全角スペース始まりの行と、末尾に空白のある行 \n最終行  ' },
  { no: 4, job: 'IT・エンジニア', target: 'IT企業', price: '30万円', subject: 'エンジニア採用のご提案', body: 'エンジニア採用のご提案です。\n詳細は https://example.com/lp?a=1&b=2 をご覧ください。' },
  { no: 5, job: '営業', target: '営業会社', price: '20万円', subject: '営業職採用のご提案', body: '営業職の採用についてのご提案です。' },
];

const MASTER_VERTICAL: [string, string][] = [
  ['会社名', '採用支援テスト株式会社'],
  ['会社名カナ', 'サイヨウシエンテストカブシキガイシャ'],
  ['部署', '採用支援事業部'],
  ['役職', ''],
  ['氏名', '山田 太郎'],
  ['姓', '山田'],
  ['名', '太郎'],
  ['フリガナ', 'ヤマダ タロウ'],
  ['セイ', 'ヤマダ'],
  ['メイ', 'タロウ'],
  ['メールアドレス', 'taro.yamada@example.co.jp'],
  ['電話番号', '080-1234-5678'],
  ['郵便番号', '160-0023'],
  ['住所', '東京都新宿区西新宿1-2-3 テストビル5F'],
  ['都道府県', '東京都'],
  ['建物名', 'テストビル5F'],
  ['会社URL', 'https://example.co.jp/'],
];

export function buildSampleSheets(o: SampleOptions = {}): SheetSpec[] {
  const alias = o.aliases ?? false;
  const companyHeaders = alias
    ? ['会社名', '公式サイト', '業種', '使用職種', '備考', '文面', '結果']
    : ['企業名', '企業HP', '業界', '職種', 'memo', '文面番号', '判定'];
  const tplHeaders = alias
    ? ['文面No', '対象職種', 'ターゲット', '単価', 'タイトル', 'お問い合わせ内容']
    : ['No', '職種', '想定ターゲット', '採用単価', '件名', '本文'];

  // 企業一覧
  const count = o.companyCount ?? SAMPLE_COMPANIES.length;
  const comps = Array.from({ length: count }, (_, i) => SAMPLE_COMPANIES[i % SAMPLE_COMPANIES.length].map((v, j) =>
    j === 0 && i >= SAMPLE_COMPANIES.length ? `${v}${i}` : v));
  let companyRows: Cell[][] = [companyHeaders, ...comps.map((c) => [c[0], c[1], c[2], '', '', '', ''])];
  if (o.blankRows) companyRows = [companyRows[0], companyRows[1], [], [null, null, null], ...companyRows.slice(2)];
  if (o.extraColumns) companyRows = companyRows.map((r, i) => [i === 0 ? '追加列' : 'x', ...r, i === 0 ? '予備' : 'y']);
  if (o.reverseColumns) companyRows = companyRows.map((r) => [...r].reverse());
  companyRows = pad(companyRows, o.headerOffset ?? 0, o.leadingBlankCols ?? 0, '企業リスト（作業用）');

  // 文面
  const tpls = [...SAMPLE_TEMPLATES];
  for (let i = 0; i < (o.extraTemplates ?? 0); i++) {
    const n = 100 + i;
    tpls.push({ no: n, job: `追加職種${i + 1}`, target: '', price: '', subject: `追加件名${i + 1}`, body: `追加本文${i + 1}\n二行目` });
  }
  let tplRows: Cell[][] = [tplHeaders, ...tpls.map((t) => [t.no, t.job, t.target, t.price, t.subject, t.body])];
  if (o.extraColumns) tplRows = tplRows.map((r, i) => [...r, i === 0 ? '備考' : 'メモ']);
  if (o.reverseColumns) tplRows = tplRows.map((r) => [...r].reverse());
  if (o.templateOrientation === 'columns') tplRows = transposeCells(tplRows);
  tplRows = pad(tplRows, o.headerOffset ?? 0, o.leadingBlankCols ?? 0, '文面一覧');

  // 問い合わせ情報
  let master = MASTER_VERTICAL.map(([k, v]) => [k, v] as [string, string]);
  if (o.phoneConflict) master.push(['携帯番号', '090-9999-0000']);
  if (o.nameConflict) master = master.map(([k, v]) => (k === '姓' ? [k, '山本'] : [k, v]) as [string, string]);
  let masterRows: Cell[][];
  if (o.masterLayout === 'horizontal') {
    masterRows = [master.map(([k]) => k), master.map(([, v]) => v)];
  } else {
    masterRows = [['項目', '内容'], ...master.map(([k, v]) => [k, o.numericPhone && k === '電話番号' ? 8012345678 : v])];
  }
  masterRows = pad(masterRows, o.headerOffset ?? 0, o.leadingBlankCols ?? 0, '送信者の基本情報');

  const names = {
    company: o.names?.company ?? (alias ? '送信先' : '企業一覧'),
    master: o.names?.master ?? (alias ? '基本情報' : 'お問い合わせ情報'),
    templates: o.names?.templates ?? (alias ? 'テンプレート' : '文面'),
  };
  const bundle = {
    company: { name: names.company, rows: companyRows },
    master: { name: names.master, rows: masterRows },
    templates: { name: names.templates, rows: tplRows },
  };
  return (o.sheetOrder ?? ['company', 'master', 'templates']).map((k) => bundle[k]);
}

function pad(rows: Cell[][], offset: number, leadCols: number, title: string): Cell[][] {
  const lead = Array.from({ length: leadCols }, () => null);
  const body = rows.map((r) => [...lead, ...r]);
  const top: Cell[][] = Array.from({ length: offset }, (_, i) => (i === 0 ? [title] : []));
  return [...top, ...body];
}

function transposeCells(rows: Cell[][]): Cell[][] {
  const w = Math.max(...rows.map((r) => r.length));
  return Array.from({ length: w }, (_, c) => rows.map((r) => r[c] ?? null));
}
