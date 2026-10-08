/**
 * 見出しの意味辞書。ここに書いてあるのは「語彙」であって、列番号やシート名ではない。
 * 完全一致 → 含有 の順で判定する（弱い語は完全一致のみ）。
 */
import type { CompanyColumn, TemplateColumn } from '../shared/types';
import { normalizeHeader } from './normalize';

export interface DictEntry {
  exact: string[];
  /** 見出しにこの語が含まれていれば該当とみなす（2文字以上の特徴的な語のみ） */
  contains?: string[];
  /** 完全一致でのみ使う弱い語 */
  weak?: string[];
}

export const COMPANY_DICT: Record<CompanyColumn, DictEntry> = {
  name: {
    exact: ['企業名', '会社名', '法人名', '事業者名', '社名', '企業名称', '会社名称', '取引先名', '送信先', '送信先企業', '送信先企業名',
      '対象企業', '対象企業名', '団体名', 'company', 'companyname', '企業', '会社', '法人', '屋号'],
    contains: ['企業名', '会社名', '法人名', '事業者名', '社名'],
    weak: ['名称'],
  },
  url: {
    exact: ['企業hp', '企業ホームページ', '公式サイト', '公式hp', 'url', 'webサイト', 'ホームページ', 'hp', 'サイトurl', '企業url', '会社url',
      'website', 'homepage', '公式url', 'web', 'サイト', '公式ホームページ', '会社hp', '会社ホームページ', 'コーポレートサイト', '企業サイト',
      '会社サイト', 'リンク', 'link', '公式'],
    contains: ['url', 'ホームページ', '公式サイト', 'webサイト', '企業hp', '会社hp', '公式hp'],
  },
  industry: {
    exact: ['業界', '業種', '業態', '事業内容', '産業', 'industry', '事業', '業界分類', 'ジャンル'],
    contains: ['業界', '業種', '事業内容'],
  },
  job: {
    exact: ['職種', '採用職種', '募集職種', '使用職種', '選定職種', 'job', '対象職種', '職種名', '想定職種', '文面職種'],
    contains: ['職種'],
  },
  memo: {
    exact: ['memo', 'メモ', '備考', '特記事項', 'コメント', 'note', 'notes', 'エラー理由', '理由', '補足', '備考欄', '要確認理由'],
    contains: ['memo', 'メモ', '備考', 'エラー'],
  },
  templateNo: {
    exact: ['文面番号', '文面no', '文章番号', 'テンプレート番号', 'テンプレno', '使用文面', '文面id', '文面', 'テンプレート', 'テンプレ',
      '文面ナンバー', '送信文面', '使用テンプレート', '使用文面番号'],
    contains: ['文面番号', '文面no', 'テンプレート番号', '文章番号', '文面id'],
  },
  judgement: {
    exact: ['判定', '可否', '結果', '送信可否', '状態', 'ステータス', '対応状況', '送信結果', '送信状況', '営業可否', '状況', '済'],
    contains: ['判定', '可否', 'ステータス', '送信結果'],
  },
};

export const TEMPLATE_DICT: Record<TemplateColumn, DictEntry> = {
  number: {
    exact: ['no', '番号', '文面番号', '文面no', '文面id', 'id', 'テンプレート番号', 'テンプレートno', '通番', '連番', '文章番号', '文面ナンバー', 'ナンバー'],
    contains: ['文面番号', '文面no', 'テンプレート番号', '文章番号', '文面id'],
  },
  job: {
    exact: ['職種', '対象職種', '想定職種', '募集職種', '採用職種', 'job', '職種名', '業種', 'カテゴリ', 'カテゴリー', '業界'],
    contains: ['職種'],
  },
  target: {
    exact: ['想定ターゲット', 'ターゲット', '対象', '対象者', '想定対象', '想定顧客', 'target', '想定企業', '対象企業'],
    contains: ['ターゲット', '想定対象'],
  },
  price: {
    exact: ['採用単価', '単価', '想定単価', '費用', '金額', 'price', 'cpa', '料金', '価格'],
    contains: ['単価'],
  },
  subject: {
    exact: ['件名', 'タイトル', 'subject', '題名', 'メール件名', 'お問い合わせ件名', '問い合わせ件名', '送信件名', '文面件名'],
    contains: ['件名', 'subject'],
  },
  body: {
    exact: ['本文', 'お問い合わせ本文', '問い合わせ本文', '問い合わせ内容', 'お問い合わせ内容', 'メッセージ', 'message', '内容', '文面本文', '営業文',
      '営業文面', '送信文', '文章', 'body', 'テキスト', '文面', '営業文章', '問い合わせ文', 'お問い合わせ文', 'メッセージ本文', '送信文面'],
    contains: ['本文', 'お問い合わせ内容', '問い合わせ内容'],
    weak: ['文面'],
  },
};

/** 行番号など、どの役割にも属さないが「見出し行らしさ」の判定に使う語 */
export const ROW_NO_WORDS = ['no', 'no.', '番号', '#', '連番', '通番', 'id'].map(normalizeHeader);

/** シート名ヒント（役割判定のボーナス点にだけ使う。これだけでは決めない） */
export const SHEET_NAME_HINTS: Record<'company' | 'master' | 'templates', string[]> = {
  company: ['企業一覧', '企業リスト', '会社一覧', '会社リスト', '送信先', '対象企業', '企業', '会社', 'リスト', 'company', 'companies', 'list', '一覧'],
  master: ['お問い合わせ情報', '問い合わせ情報', '基本情報', '入力情報', '送信者情報', 'マスター', 'マスタ', '情報', 'master', 'info', '連絡先'],
  templates: ['文面', 'テンプレート', 'テンプレ', '営業文', '問い合わせ文', '送信文', 'template', 'templates', '本文'],
};

export type MatchStrength = 0 | 1 | 2 | 3;

/** 見出し1つを辞書に当てる。戻り値のstrength: 3=完全一致 / 2=含有 / 1=弱語の完全一致 */
export function matchEntry(norm: string, entry: DictEntry): MatchStrength {
  if (!norm) return 0;
  if (entry.exact.some((w) => normalizeHeader(w) === norm)) return 3;
  if (entry.weak?.some((w) => normalizeHeader(w) === norm)) return 1;
  if (entry.contains?.some((w) => norm.includes(normalizeHeader(w)))) return 2;
  return 0;
}

/** 辞書全体に対して、最も強く一致するキーを返す。同点で複数あれば ambiguous */
export function matchDict<K extends string>(
  header: string,
  dict: Record<K, DictEntry>,
): { key: K; strength: MatchStrength } | null {
  const norm = normalizeHeader(header);
  if (!norm) return null;
  let best: { key: K; strength: MatchStrength; len: number } | null = null;
  for (const key of Object.keys(dict) as K[]) {
    const s = matchEntry(norm, dict[key]);
    if (s === 0) continue;
    // 同じ強さなら、より長い語に当たったものを優先（「職種」と「採用職種」など）
    const len = Math.max(
      0,
      ...[...dict[key].exact, ...(dict[key].contains ?? [])]
        .map(normalizeHeader)
        .filter((w) => (s === 3 ? w === norm : norm.includes(w)))
        .map((w) => w.length),
    );
    if (!best || s > best.strength || (s === best.strength && len > best.len)) best = { key, strength: s, len };
  }
  return best ? { key: best.key, strength: best.strength } : null;
}
