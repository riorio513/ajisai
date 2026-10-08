/** サーバーとUIの間でやり取りするデータの型 */
import type {
  CaptchaInfo, ContactPageCandidate, Evidence, InputPlan, MasterConflict, QualityIssue, SiteInfo, StatusCode, StructureResult,
} from './types';

export interface TransferItem {
  id: string;
  label: string;
  /** コピーされる値（表示値＝コピー値） */
  value: string;
  note?: string;
}

export interface CompanyView {
  key: string;
  order: number;
  total: number;
  name: string;
  excelUrl: string;
  excelRow: number;
  stage: 'pending' | 'running' | 'done';
  status: StatusCode;
  statusMessage: string;
  severity: 'ok' | 'warn' | 'error' | 'pending';
  /** true の間は入力支援パネルを出さず、エラー表示を優先する */
  blocking: boolean;
  site?: SiteInfo;
  contactUrl?: string;
  contactCandidates: ContactPageCandidate[];
  solicitation: {
    label: string;
    verdict: 'none' | 'banned' | 'unclear';
    evidence: Evidence[];
    checkedUrls: string[];
    confirmedByUser: boolean;
  };
  job: {
    label?: string;
    exact?: boolean;
    by: string;
    reason: string;
    evidence: Evidence[];
    options: { label: string; templateIds: string[] }[];
  };
  template?: { id: string; number: string; job: string; where: string };
  templateChoices?: { id: string; number: string; job: string; where: string }[];
  /** フォームが特定の人向けか判断できない場合に、利用者が確認済みにできる */
  canConfirmForm?: boolean;
  errorPanel?: { title: string; reason: string; url?: string; quote?: string; instruction?: string };
  transfer: TransferItem[];
  plan?: InputPlan;
  formInfo?: { url: string; title: string; isIframe: boolean; fieldCount: number; otherCandidates: { index: number; fieldCount: number; frameUrl: string }[]; formIndex: number };
  evidence: Evidence[];
  steps: string[];
  researchedAt?: string;
  excelReference: { industry: string; job: string; memo: string; templateNo: string; judgement: string };
}

export interface CompanyRow {
  key: string;
  order: number;
  name: string;
  stage: 'pending' | 'running' | 'done';
  status: StatusCode;
  severity: 'ok' | 'warn' | 'error' | 'pending';
}

export interface AppState {
  loaded: boolean;
  excelPath?: string;
  loadedAt?: string;
  structure?: StructureResult;
  quality: QualityIssue[];
  conflicts: MasterConflict[];
  resolvedConflicts: { id: string; title: string; chosen: string }[];
  companies: CompanyRow[];
  diffMessages: string[];
  ai: { name: string; available: boolean; enabled: boolean };
  browser: { running: boolean; name?: string; error?: string };
  queue: { running: boolean; current?: string; done: number; total: number };
  busy?: string;
  /** Excel構造確認画面で使う、シート一覧 */
  sheetNames: string[];
  masterUnclassified: { label: string; value: string }[];
  /** 問い合わせ情報を、どの項目としてどのセルから読んだか（ズレの確認用） */
  masterReading: { field: string; label: string; value: string; cells: string[] }[];
  jobs: { label: string; templateIds: string[] }[];
  recent: { path: string }[];
  platform: string;
}

export interface SheetPreview {
  sheet: string;
  rows: string[][];
  /** 見出し行の推定（0始まり） */
  suggestedHeaderRow: number;
  suggested: Record<string, number>;
}
