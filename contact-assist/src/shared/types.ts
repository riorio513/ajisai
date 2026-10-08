/**
 * アプリ全体で共有する型。
 * ここにはロジックを置かない（型と定数のみ）。
 */

// ───────── Excel 生データ ─────────

/** セルの補足情報（テキスト以外） */
export interface CellMeta {
  /** 数値セルだった（電話番号の先頭0欠落の検知に使う） */
  numeric?: boolean;
  /** ハイパーリンク先 */
  hyperlink?: string;
}

export interface RawSheet {
  name: string;
  /** 0始まりの位置（シート順）。ロジックでは使わず表示用 */
  index: number;
  /** rows[r][c] = セルの文字列（Excelに書かれている状態のまま。trimしない） */
  rows: string[][];
  meta: Record<string, CellMeta>; // key = `${r},${c}`
}

export interface RawWorkbook {
  sheets: RawSheet[];
}

// ───────── 構造解析 ─────────

export type SheetRole = 'company' | 'master' | 'templates' | 'unknown';

export type CompanyColumn = 'name' | 'url' | 'industry' | 'job' | 'memo' | 'templateNo' | 'judgement';
export type TemplateColumn = 'number' | 'job' | 'target' | 'price' | 'subject' | 'body';

/** 保存・復元できるマッピング。列番号ではなく「見出し文字列」で持つ（列移動に強くする） */
export interface SheetMappingSpec {
  sheet: string;
  /** field -> 見出し文字列（Excel上のそのままの文字列） */
  headers: Record<string, string>;
  /** 同じ見出し文字列が複数ある場合、何番目か（0始まり） */
  occ?: Record<string, number>;
}

export interface UserMapping {
  company?: SheetMappingSpec;
  templates?: SheetMappingSpec & { orientation?: 'rows' | 'columns' };
  master?: { sheet: string };
}

export interface CompanyTableInfo {
  sheet: string;
  headerRow: number; // 0始まり
  columns: Partial<Record<CompanyColumn, number>>;
  headerTexts: Partial<Record<CompanyColumn, string>>;
}

export interface TemplateTableInfo {
  sheet: string;
  orientation: 'rows' | 'columns';
  headerRow: number; // orientation=columns の場合は転置後の行
  columns: Partial<Record<TemplateColumn, number>>;
  headerTexts: Partial<Record<TemplateColumn, string>>;
}

export interface Company {
  /** 企業を識別するキー（企業名 + 同名の場合の出現番号） */
  key: string;
  /** 0始まりの順序（Excel上の並び順） */
  order: number;
  /** Excel上の行番号（1始まり・表示用） */
  excelRow: number;
  name: string;
  url: string;
  industry: string;
  excelJob: string;
  excelMemo: string;
  excelTemplateNo: string;
  excelJudgement: string;
}

export interface Template {
  /** 文面を識別するキー。番号列があれば番号、なければ職種 */
  id: string;
  excelRow: number;
  /** 表示用の位置（例: 「7行目」「E列」） */
  where: string;
  number: string;
  job: string;
  target: string;
  price: string;
  /** Excel原文（加工禁止） */
  subject: string;
  /** Excel原文（加工禁止） */
  body: string;
}

// ───────── 問い合わせ情報マスター ─────────

export type MasterFieldId =
  | 'companyName' | 'companyKana' | 'department' | 'position'
  | 'fullName' | 'lastName' | 'firstName'
  | 'fullKana' | 'lastKana' | 'firstKana'
  | 'email'
  | 'phone' | 'phone1' | 'phone2' | 'phone3'
  | 'postal' | 'postal1' | 'postal2'
  | 'address' | 'prefecture' | 'city' | 'town' | 'street' | 'building'
  | 'url' | 'inquiryType';

export interface MasterEntry {
  field: MasterFieldId;
  value: string;
  label: string;
  sheet: string;
  excelRow: number;
  /** 電話番号1/2/3 のような連番ラベルの番号 */
  part?: number;
  /** 数値セルとして読めた */
  numeric?: boolean;
}

export interface ConflictCandidate {
  id: string;
  /** 画面に出す説明（例: 「電話番号 (B12)」） */
  label: string;
  /** 画面に出す値 */
  display: string;
  /** 採用した場合にマスターへ適用する値 */
  apply: Partial<Record<MasterFieldId, string>>;
  /** 採用した場合に無効化する元フィールド（別ソースを捨てる場合） */
  drop?: MasterFieldId[];
}

export interface MasterConflict {
  id: string;
  title: string;
  fieldGroup: string;
  candidates: ConflictCandidate[];
}

export interface MasterData {
  /** 確定済みの値（矛盾が未解決の項目は含まれない） */
  values: Partial<Record<MasterFieldId, string>>;
  /** 同じ項目の表記バリエーション（電話番号の区切り位置の根拠に使う） */
  variants: Partial<Record<MasterFieldId, string[]>>;
  /** 数値セルで読めたため先頭0が欠けている可能性のある項目 */
  numericSuspect: MasterFieldId[];
  conflicts: MasterConflict[];
  /** ユーザーが選択して解決済みの矛盾（表示用） */
  resolved: { id: string; title: string; chosen: string }[];
  /** 辞書に無いラベル（参考表示のみ） */
  unclassified: { label: string; value: string; excelRow: number }[];
  sheet?: string;
}

// ───────── データ品質 ─────────

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface QualityIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  where?: string;
}

// ───────── 構造解析の結果 ─────────

export interface SheetAnalysis {
  name: string;
  index: number;
  rowCount: number;
  colCount: number;
  role: SheetRole;
  /** 各役割の適合スコア */
  scores: { company: number; master: number; templates: number };
  note?: string;
}

export interface StructureProblem {
  role: 'company' | 'master' | 'templates';
  message: string;
  /** 候補シート名（複数候補で決められない場合） */
  candidates?: string[];
}

export interface StructureResult {
  status: 'ok' | 'needs-confirmation';
  fingerprint: string;
  sheets: SheetAnalysis[];
  companyTable?: CompanyTableInfo;
  templateTable?: TemplateTableInfo;
  masterSheet?: string;
  problems: StructureProblem[];
  /** 保存済みマッピングを検証した結果の説明 */
  mappingNotes: string[];
  usedSavedMapping: { company: boolean; templates: boolean; master: boolean };
}

// ───────── ステータス ─────────

export const STATUS = {
  OK: '〇',
  NO_FORM: 'フォーム無し',
  NO_SALES: '営業お断り',
  NOT_TARGET_FORM: '対象外フォーム',
  CHAR_LIMIT: '文字数制限',
  COMPANY_UNCLEAR: '企業特定要確認',
  SALES_UNCLEAR: '営業可否要確認',
  ACCESS: 'アクセス不可',
  DATA_MISSING: '入力必須データ不足',
  MASTER_CONFLICT: 'マスターデータ矛盾',
  FORM_UNCLEAR: 'フォーム解析要確認',
  ADDRESS_SPLIT: '住所分割要確認',
  PHONE_SPLIT: '電話番号分割要確認',
  NAME_SPLIT: '氏名分割要確認',
  JOB_UNCLEAR: '職種選定要確認',
  OTHER: 'その他エラー',
  PENDING: '未調査',
  RUNNING: '調査中',
} as const;

export type StatusCode = (typeof STATUS)[keyof typeof STATUS];

// ───────── 調査証拠 ─────────

export type EvidenceKind =
  | '企業特定' | '営業禁止' | '営業禁止確認' | '職種' | '問い合わせ案内' | 'フォーム' | '対象外判定' | '近似職種';

export interface Evidence {
  url: string;
  kind: EvidenceKind;
  /** 必要部分だけの短い根拠 */
  snippet: string;
  at: string; // ISO
}

// ───────── フォーム解析 ─────────

export type ControlKind = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'other';

export interface RawOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** ブラウザ内スクリプトが返す、1入力要素（またはラジオ/チェックのグループ）の生情報 */
export interface RawField {
  /** フォーム内での表示順（0始まり） */
  order: number;
  tag: string;
  type: string;
  name: string;
  id: string;
  placeholder: string;
  required: boolean;
  ariaRequired: boolean;
  maxlength: number | null;
  minlength: number | null;
  pattern: string;
  inputmode: string;
  autocomplete: string;
  ariaLabel: string;
  title: string;
  /** label要素・見出しセルなどから得た、この欄のラベル */
  label: string;
  /** 欄の近くにある補足文（注意書き） */
  hint: string;
  /** 周辺のテキスト（文字数カウンタ等の検出にも使う） */
  nearText: string;
  /** ラジオ/チェック群の質問文 */
  groupLabel: string;
  /** 必須を示す class 名などの手がかり（required, hissu 等を含む場合がある） */
  classText: string;
  options: RawOption[];
  /** DOM上の配置（ページ座標） */
  rect: { top: number; left: number; width: number; height: number };
  frameUrl: string;
  inShadow: boolean;
  disabled: boolean;
  readonly: boolean;
  /** textarea の rows 属性など。参考情報 */
  multiple: boolean;
}

export interface RawFormInfo {
  index: number;
  frameUrl: string;
  isIframe: boolean;
  formId: string;
  formName: string;
  formClass: string;
  hasFormTag: boolean;
  /** フォーム近くの見出し */
  headings: string[];
  /** フォーム領域のテキスト（注意書きの検出に使用。長すぎる場合は切り詰め） */
  text: string;
  submitLabels: string[];
  fields: RawField[];
  isSearchLike: boolean;
}

export interface CaptchaInfo {
  present: boolean;
  kinds: string[];
}

export interface RawPageForms {
  url: string;
  title: string;
  forms: RawFormInfo[];
  captcha: CaptchaInfo;
  /** フォームの外で見つかった注意書き候補（営業禁止検出用） */
  pageText: string;
}

// ───────── 項目の意味分類 ─────────

export type StdField =
  | 'company' | 'companyKana' | 'department' | 'position'
  | 'name' | 'lastName' | 'firstName'
  | 'kana' | 'lastKana' | 'firstKana'
  | 'email' | 'emailConfirm'
  | 'phone' | 'phone1' | 'phone2' | 'phone3'
  | 'postal' | 'postal1' | 'postal2'
  | 'address' | 'prefecture' | 'city' | 'town' | 'street' | 'building'
  | 'url' | 'inquiryType' | 'subject' | 'body' | 'consent'
  | 'fax' | 'unknown';

export const STD_LABEL: Record<StdField, string> = {
  company: '会社名', companyKana: '会社名カナ', department: '部署', position: '役職',
  name: '氏名', lastName: '姓', firstName: '名',
  kana: 'フリガナ', lastKana: '姓フリガナ', firstKana: '名フリガナ',
  email: 'メール', emailConfirm: 'メール（確認）',
  phone: '電話番号', phone1: '電話番号①', phone2: '電話番号②', phone3: '電話番号③',
  postal: '郵便番号', postal1: '郵便番号①', postal2: '郵便番号②',
  address: '住所', prefecture: '都道府県', city: '市区町村', town: '町域', street: '番地', building: '建物名',
  url: '会社URL', inquiryType: '問い合わせ種別', subject: '件名', body: '本文', consent: '同意',
  fax: 'FAX', unknown: '不明な入力項目',
};

export type KanaScript = 'hiragana' | 'katakana' | 'unknown';
export type Tri<T> = T | 'unknown';

/** HTML属性・周辺文章から読み取った入力条件 */
export interface FieldConditions {
  required: boolean | 'unknown';
  width: Tri<'half' | 'full'>;
  charset: Tri<'digits' | 'alnum' | 'hiragana' | 'katakana' | 'any'>;
  kanaScript: KanaScript;
  hyphen: Tri<'with' | 'without'>;
  space: Tri<'with' | 'without'>;
  maxLength: number | null;
  minLength: number | null;
  /** 判断根拠（デバッグ・画面表示用） */
  evidence: string[];
}

export interface FormField {
  raw: RawField;
  control: ControlKind;
  std: StdField;
  /** 分類の根拠 */
  stdReason: string;
  stdBy: 'rule' | 'ai' | 'none';
  /** 分類の確からしさ。low の場合は画面で「要確認」と表示する */
  stdConfidence: 'high' | 'low';
  /** 電話番号・郵便番号が想定外の個数に分割されている場合 */
  splitIssue?: 'phone' | 'postal';
  conditions: FieldConditions;
  /** 画面に出す名前（ラベル由来） */
  displayLabel: string;
}

export interface FormAnalysis {
  url: string;
  title: string;
  frameUrl: string;
  isIframe: boolean;
  formIndex: number;
  headings: string[];
  fields: FormField[];
  captcha: CaptchaInfo;
  submitLabels: string[];
  /** 本文の文字数上限候補 */
  bodyLimit: { limit: number | null; source: string };
  subjectLimit: { limit: number | null; source: string };
  /** 他にも問い合わせフォームらしきものがあった場合 */
  otherCandidates: { index: number; fieldCount: number; frameUrl: string }[];
  /** フォーム周辺の注意書き（営業禁止検出用の生テキスト） */
  noticeText: string;
  analyzedAt: string;
}
