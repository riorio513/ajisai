/**
 * AI 判断の差し替え口。
 * フォーム解析・UI・Excel処理は、このインターフェースにだけ依存する。
 * 特定のAI（Claude CLI など）への依存は、このインターフェースを実装するクラスの中に閉じ込める。
 *
 * AI に渡してよい情報: 公開ウェブページの文章、フォーム項目の属性（ラベル・name等）、Excelの職種名の一覧。
 * AI に渡さない情報: 氏名・メール・電話番号・住所などの個人情報、問い合わせ本文全文。
 */
import type { ControlKind, StdField } from '../shared/types';

export interface SolicitationInput {
  company: string;
  passages: { url: string; text: string }[];
}
export interface SolicitationVerdict {
  verdict: 'banned' | 'allowed' | 'unclear';
  /** 根拠となる文（passages内の原文から抜粋） */
  quote?: string;
  url?: string;
  reason: string;
}

export interface JobPickInput {
  company: string;
  industryHint?: string;
  evidence: { url: string; kind: string; text: string }[];
  jobs: { id: string; label: string }[];
}
export interface JobPick {
  /** jobs の id。選べなければ null */
  jobId: string | null;
  /** 採用ページ等に同じ職種の記載があり完全に一致する場合 true、近似なら false */
  exact: boolean;
  reason: string;
}

export interface CompanyIdInput {
  company: string;
  hint?: string;
  candidates: { index: number; url: string; title: string; excerpt: string }[];
}
export interface CompanyId {
  index: number | null;
  reason: string;
}

export interface FieldClassifyInput {
  control: ControlKind;
  label: string;
  name: string;
  id: string;
  placeholder: string;
  type: string;
  hint: string;
  options: string[];
}
export interface FieldClassify {
  std: StdField | null;
  reason: string;
}

export interface FormEligibilityInput {
  title: string;
  headings: string[];
  excerpt: string;
}
export interface FormEligibility {
  /** general: 一般の法人問い合わせに使える / restricted: 特定の人専用 / unclear */
  kind: 'general' | 'restricted' | 'unclear';
  reason: string;
}

export interface OptionPickInput {
  question: string;
  options: string[];
  purpose: string;
}
export interface OptionPick {
  option: string | null;
  reason: string;
}

export interface AIProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  judgeSolicitation(input: SolicitationInput): Promise<SolicitationVerdict>;
  pickJob(input: JobPickInput): Promise<JobPick>;
  identifyCompany(input: CompanyIdInput): Promise<CompanyId>;
  classifyField(input: FieldClassifyInput): Promise<FieldClassify>;
  judgeFormEligibility(input: FormEligibilityInput): Promise<FormEligibility>;
  pickOption(input: OptionPickInput): Promise<OptionPick>;
}

/** AIが使えない環境用。すべて「判断できない」を返し、呼び出し側は「要確認」にする */
export class NullAIProvider implements AIProvider {
  readonly name = 'なし（AI未使用）';
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async judgeSolicitation(): Promise<SolicitationVerdict> {
    return { verdict: 'unclear', reason: 'AIが利用できないため判断しません' };
  }
  async pickJob(): Promise<JobPick> {
    return { jobId: null, exact: false, reason: 'AIが利用できないため判断しません' };
  }
  async identifyCompany(): Promise<CompanyId> {
    return { index: null, reason: 'AIが利用できないため判断しません' };
  }
  async classifyField(): Promise<FieldClassify> {
    return { std: null, reason: 'AIが利用できないため判断しません' };
  }
  async judgeFormEligibility(): Promise<FormEligibility> {
    return { kind: 'unclear', reason: 'AIが利用できないため判断しません' };
  }
  async pickOption(): Promise<OptionPick> {
    return { option: null, reason: 'AIが利用できないため判断しません' };
  }
}
