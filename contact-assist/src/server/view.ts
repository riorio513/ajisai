/**
 * 現在のExcel（model）と保存済みの調査結果から、画面に出すデータ（CompanyView）を毎回組み立てる。
 * 文面・企業名・問い合わせ情報は常に「いまのExcel」から取り、保存データの古い内容は使わない。
 */
import type { CompanyView, TransferItem } from '../shared/api';
import type { Company, Evidence, InputPlan, StatusCode, Template } from '../shared/types';
import { STATUS } from '../shared/types';
import type { WorkbookModel } from '../schema/model';
import type { StoredCompany } from '../storage/progress';
import { buildPlan } from '../clipboard/plan';
import { normalizeKey } from '../transformer';
import { isBlank } from '../schema/normalize';

const ERROR_STATUSES = new Set<StatusCode>([
  STATUS.NO_SALES, STATUS.NO_FORM, STATUS.NOT_TARGET_FORM, STATUS.ACCESS, STATUS.COMPANY_UNCLEAR, STATUS.MASTER_CONFLICT,
]);
const BLOCKING = new Set<StatusCode>([
  STATUS.NO_SALES, STATUS.NO_FORM, STATUS.NOT_TARGET_FORM, STATUS.ACCESS, STATUS.COMPANY_UNCLEAR, STATUS.MASTER_CONFLICT,
  STATUS.SALES_UNCLEAR, STATUS.CHAR_LIMIT, STATUS.PENDING, STATUS.RUNNING, STATUS.JOB_UNCLEAR, STATUS.OTHER,
]);

/** 計画(plan)のエラーを優先順に並べる */
const PLAN_PRIORITY: StatusCode[] = [
  STATUS.CHAR_LIMIT, STATUS.DATA_MISSING, STATUS.FORM_UNCLEAR, STATUS.ADDRESS_SPLIT, STATUS.PHONE_SPLIT, STATUS.NAME_SPLIT, STATUS.OTHER,
];

export interface ViewContext {
  company: Company;
  total: number;
  stored?: StoredCompany;
  model: WorkbookModel;
  running: boolean;
  ignore?: string[];
}

interface Resolved {
  template?: Template;
  choices?: Template[];
  jobLabel?: string;
  by: string;
  exact?: boolean;
  reason: string;
  problem?: string;
}

function resolveTemplate(stored: StoredCompany | undefined, model: WorkbookModel): Resolved {
  const ov = stored?.overrides;
  const r = stored?.research;
  if (ov?.templateId) {
    const t = model.templates.find((x) => x.id === ov.templateId);
    if (t) return { template: t, jobLabel: t.job, by: 'manual', reason: '利用者が文面を直接選択しました' };
  }
  const label = ov?.jobLabel ?? r?.job.label;
  const by = ov?.jobLabel ? 'manual' : r?.job.by ?? 'none';
  const reason = ov?.jobLabel ? '利用者が職種を選択しました' : r?.job.reason ?? '';
  if (!label) return { by: 'none', reason, problem: reason || '職種が未選択です' };
  const opt = model.jobs.find((j) => normalizeKey(j.label) === normalizeKey(label));
  if (!opt) return { by: 'none', jobLabel: label, reason, problem: `職種「${label}」は現在のExcelの文面にありません。職種を選び直してください` };
  const ts = opt.templateIds.map((id) => model.templates.find((t) => t.id === id)!).filter(Boolean);
  if (ts.length === 1) return { template: ts[0], jobLabel: opt.label, by, exact: ov?.jobLabel ? undefined : r?.job.exact, reason };
  return { choices: ts, jobLabel: opt.label, by, reason, problem: `職種「${opt.label}」の文面が${ts.length}件あります。使う文面を選んでください` };
}

export function buildCompanyView(ctx: ViewContext): CompanyView {
  const { company, stored, model } = ctx;
  const r = stored?.research;
  const base: CompanyView = {
    key: company.key,
    order: company.order,
    total: ctx.total,
    name: company.name,
    excelUrl: company.url,
    excelRow: company.excelRow,
    stage: ctx.running ? 'running' : r ? 'done' : 'pending',
    status: ctx.running ? STATUS.RUNNING : STATUS.PENDING,
    statusMessage: ctx.running ? '調査中です…' : 'まだ調査していません。「調査する」を押してください',
    severity: 'pending',
    blocking: true,
    contactCandidates: r?.contactCandidates ?? [],
    solicitation: { label: '未確認', verdict: 'none', evidence: [], checkedUrls: [], confirmedByUser: false },
    job: { by: 'none', reason: '', evidence: [], options: model.jobs.map((j) => ({ label: j.label, templateIds: j.templateIds })) },
    transfer: [],
    evidence: r?.evidence ?? [],
    steps: r?.steps ?? [],
    researchedAt: r?.researchedAt,
    excelReference: {
      industry: company.industry, job: company.excelJob, memo: company.excelMemo, templateNo: company.excelTemplateNo, judgement: company.excelJudgement,
    },
  };
  if (!r || ctx.running) return base;
  const research = r;

  base.site = r.site;
  base.contactUrl = stored?.overrides?.contactUrl ?? r.contactUrl;
  const salesConfirmed = stored?.overrides?.salesConfirmed === true;
  const evOf = (kinds: Evidence['kind'][]) => research.evidence.filter((e) => kinds.includes(e.kind));
  base.solicitation = {
    verdict: r.solicitation.verdict,
    label: r.solicitation.verdict === 'banned' ? '営業お断り' : r.solicitation.verdict === 'unclear' ? (salesConfirmed ? '要確認（利用者が確認済み）' : '営業可否要確認') : '確認されず',
    evidence: evOf(['営業禁止', '営業禁止確認']),
    checkedUrls: r.solicitation.checkedUrls,
    confirmedByUser: salesConfirmed,
  };

  const res = resolveTemplate(stored, model);
  base.job = {
    label: res.jobLabel,
    exact: res.exact,
    by: res.by,
    reason: res.reason,
    evidence: evOf(['職種', '近似職種']),
    options: base.job.options,
  };
  if (res.template) base.template = { id: res.template.id, number: res.template.number, job: res.template.job, where: res.template.where };
  if (res.choices) base.templateChoices = res.choices.map((t) => ({ id: t.id, number: t.number, job: t.job, where: t.where }));

  // ── 最終ステータスの決定（優先順位つき）──
  let status: StatusCode = STATUS.OK;
  let message = '調査完了。入力支援パネルを使えます';
  let plan: InputPlan | undefined;

  const form = r.form;
  if (r.code === STATUS.NO_SALES || r.code === STATUS.COMPANY_UNCLEAR || r.code === STATUS.ACCESS || r.code === STATUS.NO_FORM || r.code === STATUS.NOT_TARGET_FORM) {
    status = r.code;
    message = r.message;
  } else if (model.master && model.master.conflicts.length > 0) {
    status = STATUS.MASTER_CONFLICT;
    message = `問い合わせ情報（Excel）に食い違いがあります: ${model.master.conflicts.map((c) => c.title).join(' / ')}`;
  } else if (r.solicitation.verdict === 'unclear' && !salesConfirmed) {
    status = STATUS.SALES_UNCLEAR;
    message = '営業目的の問い合わせが禁止されているか判断できません。根拠を確認してください';
  } else if (!form) {
    status = STATUS.FORM_UNCLEAR;
    message = 'フォームの解析結果がありません。「フォームを再解析」を押してください';
  } else if (res.problem) {
    status = res.choices ? STATUS.OTHER : STATUS.JOB_UNCLEAR;
    message = res.problem;
  } else if (res.template && isBlank(res.template.body)) {
    status = STATUS.OTHER;
    message = `文面（${res.template.number || res.template.job}）の本文がExcelで空です`;
  } else if (r.code === STATUS.FORM_UNCLEAR && !stored?.overrides?.formConfirmed) {
    status = STATUS.FORM_UNCLEAR;
    message = r.message;
    base.canConfirmForm = true;
  }

  if (form && model.master && res.template && !ERROR_STATUSES.has(status) && status !== STATUS.SALES_UNCLEAR) {
    plan = buildPlan({ analysis: form, master: model.master, companyName: company.name, template: res.template, ignore: ctx.ignore });
    if (status === STATUS.OK) {
      const codes = new Set(plan.errors.map((e) => e.code));
      const first = PLAN_PRIORITY.find((c) => codes.has(c));
      if (first) {
        status = first;
        message = plan.errors.filter((e) => e.code === first).map((e) => e.message).join(' / ');
      }
    }
  }

  base.status = status;
  base.statusMessage = message;
  base.severity = status === STATUS.OK ? 'ok' : ERROR_STATUSES.has(status) ? 'error' : 'warn';
  base.blocking = BLOCKING.has(status);
  if (form) {
    base.formInfo = {
      url: form.url, title: form.title, isIframe: form.isIframe, fieldCount: form.fields.length, otherCandidates: form.otherCandidates, formIndex: form.formIndex,
    };
  }
  // 入力支援パネルは、作業を止めるべき状態では出さない（エラー表示を優先する）
  if (plan && !BLOCKING.has(status)) base.plan = plan;

  // ── エラー表示 ──
  const ev = base.solicitation.evidence.find((e) => e.kind === '営業禁止') ?? base.solicitation.evidence[0];
  if (status === STATUS.NO_SALES) {
    base.errorPanel = {
      title: STATUS.NO_SALES,
      reason: '営業目的のお問い合わせは禁止されているため',
      url: ev?.url ?? base.contactUrl,
      quote: ev?.snippet,
      instruction: 'この企業では問い合わせ作業を行わないでください。',
    };
  } else if (status === STATUS.SALES_UNCLEAR) {
    base.errorPanel = {
      title: STATUS.SALES_UNCLEAR,
      reason: message,
      url: ev?.url,
      quote: ev?.snippet,
      instruction: '根拠のページを開いて内容を確認してください。営業可能と判断した場合のみ「確認した（営業可として進める）」を押してください。',
    };
  } else if (status !== STATUS.OK) {
    base.errorPanel = { title: status, reason: message, url: base.contactUrl ?? base.site?.url };
  }

  // ── Excel転記用 ──
  if (status === STATUS.NO_SALES) {
    const where = ev ? `「${ev.snippet}」（${ev.url}）` : '';
    base.transfer = [
      { id: 'tr-judgement', label: '判定', value: status },
      { id: 'tr-memo', label: 'memo / エラー理由', value: `営業目的の問い合わせは禁止されているため${where ? ' ' + where : ''}` },
    ];
    base.contactUrl = undefined; // 営業禁止のサイトへ問い合わせを誘導しない
    return base;
  }
  const transfer: TransferItem[] = [
    { id: 'tr-judgement', label: '判定', value: status },
    { id: 'tr-job', label: '職種', value: res.jobLabel ?? '', note: res.jobLabel ? undefined : '職種未選択' },
    {
      id: 'tr-template',
      label: '文面番号',
      value: res.template?.number ?? '',
      note: res.template ? (isBlank(res.template.number) ? 'Excelに文面番号の列（値）がありません' : undefined) : '文面未確定',
    },
    {
      id: 'tr-memo',
      label: 'memo / エラー理由',
      value: status === STATUS.OK ? '' : message,
      note: status === STATUS.OK ? '記入なし' : undefined,
    },
  ];
  if (base.contactUrl) transfer.push({ id: 'tr-url', label: '問い合わせURL', value: base.contactUrl });
  base.transfer = transfer;
  return base;
}
