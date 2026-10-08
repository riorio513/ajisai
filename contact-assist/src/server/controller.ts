/**
 * アプリ全体の状態管理。Excelの読込、企業ごとの調査、ブラウザ、進捗保存、再読込をまとめる。
 * UI からは HTTP API 経由でのみ呼ばれる。
 */
import { join } from 'node:path';
import type { AIProvider } from '../ai';
import { NullAIProvider, createClaudeCliProvider } from '../ai';
import type { AppState, CompanyRow, CompanyView, SheetPreview } from '../shared/api';
import type { MasterFieldId, RawWorkbook, SheetMappingSpec, UserMapping } from '../shared/types';
import { STATUS } from '../shared/types';
import { readWorkbookFromFile } from '../excel/reader';
import { buildModel, WorkbookModel } from '../schema/model';
import { buildSpec } from '../schema/analyze';
import { FIELD_TITLE } from '../master-data/build';
import { scanHeaderRow, transpose } from '../schema/table';
import { COMPANY_DICT, TEMPLATE_DICT } from '../schema/dictionary';
import { analyzeForms } from '../form-analyzer/analyze';
import { BrowserSession, ReadOnlyPage } from '../browser/session';
import { reanalyzeForm, refineFormWithAI, rerunAiJudgments, researchCompanyWithMemory, ResearchMemory } from '../research/pipeline';
import { diffSnapshots, ExcelDiff, makeSnapshot } from '../storage/diff';
import { writeLog } from '../storage/logger';
import { dataDir } from '../storage/paths';
import { CompanyOverrides, ProgressStore, StoredCompany } from '../storage/progress';
import { SettingsStore, workbookKey } from '../storage/settings';
import { normalizeKey } from '../transformer';
import { cleanPath, openInDefaultBrowser, pickExcelFile } from './system';
import { buildCompanyView } from './view';

export class UserError extends Error {}

interface Loaded {
  path: string;
  wk: string;
  raw: RawWorkbook;
  model: WorkbookModel;
  progress: ProgressStore;
  loadedAt: string;
  diff?: ExcelDiff;
}

export class Controller {
  private loaded: Loaded | null = null;
  private readonly settings = new SettingsStore();
  private ai: AIProvider = new NullAIProvider();
  private aiAvailable = false;
  private aiCheckedAt = 0;
  private browser: BrowserSession | null = null;
  private browserError?: string;
  private researchPage: ReadOnlyPage | null = null;
  private readonly formPages = new Map<string, ReadOnlyPage>();
  private readonly memory = new Map<string, ResearchMemory>();
  private chain: Promise<unknown> = Promise.resolve();
  private busy?: string;
  private readonly running = new Set<string>();
  private queue = { running: false, current: undefined as string | undefined, done: 0, total: 0, stop: false };
  private cancel = { cancelled: false };
  /** 状態が変わるたびに増やす。一覧の再計算を、変化があったときだけにする */
  private rev = 0;
  private rowsCache: { key: string; rows: CompanyRow[] } | null = null;

  constructor(private readonly opts: { headless?: boolean } = {}) {}

  // ───────── AI ─────────

  private async refreshAi(): Promise<void> {
    const s = await this.settings.get();
    const enabled = s.aiEnabled && process.env.ASSIST_AI !== 'off';
    if (!enabled) {
      this.ai = new NullAIProvider();
      this.aiAvailable = false;
      return;
    }
    if (this.ai instanceof NullAIProvider) this.ai = createClaudeCliProvider();
    if (Date.now() - this.aiCheckedAt > 5 * 60 * 1000) {
      this.aiAvailable = await this.ai.isAvailable();
      this.aiCheckedAt = Date.now();
    }
  }

  /** AIが無効/使えないときは NullAIProvider を使う */
  private currentAi(): AIProvider {
    return this.aiAvailable ? this.ai : new NullAIProvider();
  }

  async setAiEnabled(enabled: boolean): Promise<void> {
    await this.settings.update((s) => (s.aiEnabled = enabled));
    this.aiCheckedAt = 0;
    await this.refreshAi();
  }

  // ───────── 直列実行 ─────────

  private exclusive<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const run = async () => {
      this.busy = label;
      try {
        return await fn();
      } finally {
        this.busy = undefined;
      }
    };
    const p = this.chain.then(run, run);
    this.chain = p.catch(() => undefined);
    return p;
  }

  // ───────── Excel ─────────

  async pick(): Promise<string | null> {
    return pickExcelFile();
  }

  async loadExcel(inputPath: string): Promise<void> {
    const path = cleanPath(inputPath);
    if (!/\.(xlsx|xlsm)$/i.test(path)) throw new UserError('Excelファイル（.xlsx / .xlsm）のパスを指定してください');
    let raw: RawWorkbook;
    try {
      raw = await readWorkbookFromFile(path);
    } catch (e) {
      const msg = (e as Error).message;
      if (/ENOENT/.test(msg)) throw new UserError(`ファイルが見つかりません: ${path}`);
      if (/EBUSY|EPERM|EACCES/.test(msg)) throw new UserError('ファイルを開けません。Excelで開いている場合は保存してから、もう一度お試しください');
      throw new UserError(`Excelを読み込めませんでした: ${msg}`);
    }
    await this.refreshAi();
    const settings = await this.settings.get();
    const wk = workbookKey(path);
    const model = buildModel(raw, { mapping: settings.mappings[wk], masterOverrides: settings.masterOverrides[wk] });
    const progress = new ProgressStore(wk, path);
    const pf = await progress.load();

    let diff: ExcelDiff | undefined;
    if (model.structure.status === 'ok') {
      const snap = makeSnapshot({ fingerprint: model.structure.fingerprint, companies: model.companies, templates: model.templates, masterValues: model.master?.values });
      diff = diffSnapshots(pf.snapshot, snap);
      for (const k of diff.invalidate) delete pf.companies[k];
      pf.snapshot = snap;
      progress.save();
    }
    this.loaded = { path, wk, raw, model, progress, loadedAt: new Date().toISOString(), diff };
    this.rev++;
    this.memory.clear();
    await this.settings.update((s) => (s.lastExcelPath = path));
    void writeLog({ action: 'excel-load', ok: model.structure.status === 'ok', message: `${model.companies.length}社 / 文面${model.templates.length}件` });
  }

  async reload(): Promise<void> {
    if (!this.loaded) throw new UserError('Excelが読み込まれていません');
    await this.loadExcel(this.loaded.path);
  }

  private need(): Loaded {
    if (!this.loaded) throw new UserError('先にExcelを読み込んでください');
    return this.loaded;
  }

  // ───────── マッピング確認 ─────────

  preview(sheetName: string, orientation: 'rows' | 'columns' = 'rows', role: 'company' | 'templates' = 'company'): SheetPreview {
    const l = this.need();
    const sh = l.raw.sheets.find((s) => s.name === sheetName);
    if (!sh) throw new UserError('シートが見つかりません');
    const grid = orientation === 'columns' ? transpose(sh.rows) : sh.rows;
    const rows = grid.slice(0, 40).map((r) => r.slice(0, 30).map((c) => (c.length > 40 ? c.slice(0, 40) + '…' : c)));
    let best = { row: 0, count: -1 };
    const suggested: Record<string, number> = {};
    for (let r = 0; r < Math.min(grid.length, 60); r++) {
      const s = role === 'company' ? scanHeaderRow(grid[r], COMPANY_DICT, {}) : scanHeaderRow(grid[r], TEMPLATE_DICT, {});
      if (s.matched.length > best.count) {
        best = { row: r, count: s.matched.length };
        Object.keys(suggested).forEach((k) => delete suggested[k]);
        for (const [k, c] of Object.entries(s.columns)) suggested[k] = c as number;
      }
    }
    // 辞書に当たる見出しが2つ未満なら、辞書に頼らず「最初の、2セル以上入っている行」を見出し候補にする
    if (best.count < 2) {
      const firstFilled = grid.findIndex((r) => r.filter((c) => c.trim() !== '').length >= 2);
      best = { row: Math.max(0, firstFilled), count: 0 };
      Object.keys(suggested).forEach((k) => delete suggested[k]);
    }
    return { sheet: sheetName, rows, suggestedHeaderRow: best.row, suggested };
  }

  async saveMapping(input: { role: 'company' | 'templates' | 'master'; sheet: string; headerRow?: number; columns?: Record<string, number>; orientation?: 'rows' | 'columns' }): Promise<void> {
    const l = this.need();
    const sh = l.raw.sheets.find((s) => s.name === input.sheet);
    if (!sh) throw new UserError('シートが見つかりません');
    const mapping: UserMapping = {};
    if (input.role === 'master') mapping.master = { sheet: sh.name };
    else {
      if (input.headerRow === undefined || !input.columns) throw new UserError('見出し行と列を指定してください');
      const orientation = input.role === 'templates' ? input.orientation ?? 'rows' : 'rows';
      const grid = orientation === 'columns' ? transpose(sh.rows) : sh.rows;
      const required = input.role === 'company' ? ['name'] : ['body', 'job'];
      for (const f of required) if (input.columns[f] === undefined) throw new UserError(`必須の項目が選ばれていません: ${f === 'name' ? '企業名' : f === 'body' ? '本文' : '職種'}`);
      const spec: SheetMappingSpec = buildSpec(grid, sh.name, input.headerRow, input.columns);
      if (input.role === 'company') mapping.company = spec;
      else mapping.templates = { ...spec, orientation };
    }
    await this.settings.update((s) => {
      s.mappings[l.wk] = { ...(s.mappings[l.wk] ?? {}), ...mapping };
    });
    await this.reload();
  }

  async clearMapping(): Promise<void> {
    const l = this.need();
    await this.settings.update((s) => delete s.mappings[l.wk]);
    await this.reload();
  }

  async resolveConflict(conflictId: string, candidateId: string): Promise<void> {
    const l = this.need();
    await this.settings.update((s) => {
      s.masterOverrides[l.wk] = { ...(s.masterOverrides[l.wk] ?? {}), [conflictId]: candidateId };
    });
    await this.reload();
  }

  async clearConflictChoices(): Promise<void> {
    const l = this.need();
    await this.settings.update((s) => delete s.masterOverrides[l.wk]);
    await this.reload();
  }

  // ───────── 状態 ─────────

  private find(key: string) {
    const l = this.need();
    const company = l.model.companies.find((c) => c.key === key);
    if (!company) throw new UserError('企業が見つかりません（Excelが更新された可能性があります。再読込してください）');
    return { l, company };
  }

  companyView(key: string): CompanyView {
    const { l, company } = this.find(key);
    return buildCompanyView({
      company,
      total: l.model.companies.length,
      stored: l.progress.current.companies[key],
      model: l.model,
      running: this.running.has(key),
    });
  }

  async state(): Promise<AppState> {
    await this.refreshAi();
    const settings = await this.settings.get();
    const base: AppState = {
      loaded: !!this.loaded,
      quality: [],
      conflicts: [],
      resolvedConflicts: [],
      companies: [],
      diffMessages: [],
      ai: { name: this.ai.name, available: this.aiAvailable, enabled: settings.aiEnabled && process.env.ASSIST_AI !== 'off' },
      browser: { running: !!this.browser && this.browser.isOpen, name: this.browser?.browserName, error: this.browserError },
      queue: { running: this.queue.running, current: this.queue.current, done: this.queue.done, total: this.queue.total },
      busy: this.busy,
      sheetNames: [],
      masterUnclassified: [],
      masterReading: [],
      jobs: [],
      recent: settings.lastExcelPath ? [{ path: settings.lastExcelPath }] : [],
      platform: process.platform,
    };
    const l = this.loaded;
    if (!l) return base;
    const cacheKey = `${this.rev}|${[...this.running].join(',')}`;
    if (this.rowsCache?.key !== cacheKey) {
      this.rowsCache = {
        key: cacheKey,
        rows: l.model.companies.map((c) => {
          const v = buildCompanyView({ company: c, total: l.model.companies.length, stored: l.progress.current.companies[c.key], model: l.model, running: this.running.has(c.key) });
          return { key: c.key, order: c.order, name: c.name, stage: v.stage, status: v.status, severity: v.severity };
        }),
      };
    }
    const rows = this.rowsCache.rows;
    return {
      ...base,
      excelPath: l.path,
      loadedAt: l.loadedAt,
      structure: l.model.structure,
      quality: l.model.quality,
      conflicts: l.model.master?.conflicts ?? [],
      resolvedConflicts: l.model.master?.resolved ?? [],
      companies: rows,
      diffMessages: l.diff?.messages ?? [],
      sheetNames: l.raw.sheets.map((s) => s.name),
      masterUnclassified: (l.model.master?.unclassified ?? []).map((u) => ({ label: u.label, value: u.value })),
      masterReading: Object.entries(l.model.master?.values ?? {}).map(([f, v]) => ({
        field: f,
        label: FIELD_TITLE[f as MasterFieldId] ?? f,
        value: v as string,
        cells: l.model.master?.sources[f as MasterFieldId] ?? [],
      })),
      jobs: l.model.jobs.map((j) => ({ label: j.label, templateIds: j.templateIds })),
    };
  }

  // ───────── ブラウザ ─────────

  private async ensureBrowser(): Promise<BrowserSession> {
    if (this.browser && !this.browser.isOpen) {
      // 利用者が調査用ブラウザを閉じた場合は、次回また起動し直す
      this.browser = null;
      this.researchPage = null;
      this.formPages.clear();
    }
    if (this.browser) return this.browser;
    try {
      this.browser = await BrowserSession.launch({ userDataDir: join(dataDir(), 'browser-profile'), headless: this.opts.headless });
      this.browserError = undefined;
      return this.browser;
    } catch (e) {
      this.browserError = (e as Error).message;
      throw new UserError(this.browserError);
    }
  }

  private async getResearchPage(): Promise<ReadOnlyPage> {
    const b = await this.ensureBrowser();
    if (!this.researchPage || this.researchPage.isClosed()) this.researchPage = await b.newPage();
    return this.researchPage;
  }

  async closeBrowser(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
    this.researchPage = null;
    this.formPages.clear();
  }

  // ───────── 調査 ─────────

  private store(key: string, company: { name: string; url: string }): StoredCompany {
    const l = this.need();
    const cur = l.progress.current.companies[key] ?? { name: company.name, url: company.url };
    l.progress.current.companies[key] = cur;
    cur.name = company.name;
    cur.url = company.url;
    return cur;
  }

  async research(key: string, mode: 'full' | 'form' | 'ai'): Promise<void> {
    const { l, company } = this.find(key);
    this.running.add(key);
    try {
      await this.exclusive(`調査中: ${company.name}`, async () => {
        const st = this.store(key, company);
        const prev = st.research;
        if (mode !== 'full' && !prev) mode = 'full';
        const ai = this.currentAi();
        if (mode === 'full') {
          const page = await this.getResearchPage();
          this.cancel = { cancelled: false };
          const { result, memory } = await researchCompanyWithMemory(
            { page, ai, signal: this.cancel, log: (m) => void writeLog({ company: company.name, action: 'research-step', message: m.replace(/https?:\/\/\S+/g, '') }) },
            company,
            l.model.jobs,
          );
          st.research = result;
          st.overrides = undefined;
          this.memory.set(key, memory);
          void writeLog({ company: company.name, action: 'research', ok: result.code === STATUS.OK, code: result.code, url: result.contactUrl });
        } else if (mode === 'form') {
          const page = await this.getResearchPage();
          const url = st.overrides?.contactUrl ?? prev!.contactUrl;
          if (!url) throw new UserError('問い合わせフォームのURLがありません。「現在企業を再調査」を実行してください');
          const form = await reanalyzeForm(page, ai, { url, formIndex: st.overrides?.formIndex });
          if (!form) throw new UserError('そのページに入力フォームが見つかりませんでした');
          st.research = { ...prev!, form, researchedAt: new Date().toISOString(), steps: [...prev!.steps, 'フォームを再解析'] };
          void writeLog({ company: company.name, action: 'reanalyze-form', ok: true, url });
        } else {
          const mem = this.memory.get(key);
          if (!mem) throw new UserError('AI判定の再実行には直近の調査内容が必要です。「現在企業を再調査」を実行してください');
          st.research = await rerunAiJudgments(ai, company, l.model.jobs, prev!, mem);
          void writeLog({ company: company.name, action: 'rerun-ai', ok: true });
        }
        st.updatedAt = new Date().toISOString();
        this.rev++;
        l.progress.save();
      });
    } finally {
      this.running.delete(key);
    }
  }

  async setOverride(key: string, patch: Partial<CompanyOverrides> & { reset?: boolean }): Promise<void> {
    const { l, company } = this.find(key);
    const st = this.store(key, company);
    if (patch.reset) st.overrides = undefined;
    else {
      const next: CompanyOverrides = { ...(st.overrides ?? {}), ...patch };
      // 職種を選び直したら、文面の個別指定は外す
      if (patch.jobLabel !== undefined && patch.templateId === undefined) delete next.templateId;
      st.overrides = next;
    }
    this.rev++;
    if (patch.formIndex !== undefined && st.research?.form) {
      // 別のフォームを選んだ → 再解析が必要
      await this.research(key, 'form');
    }
    l.progress.save();
  }

  // ───────── 人間のためのフォーム表示 ─────────

  async openForm(key: string, where: 'controlled' | 'default'): Promise<string> {
    const { company } = this.find(key);
    const v = this.companyView(key);
    const url = v.contactUrl;
    if (!url) throw new UserError('問い合わせフォームのURLがありません');
    if (where === 'default') {
      if (!openInDefaultBrowser(url)) throw new UserError('既定のブラウザを開けませんでした');
      return url;
    }
    await this.exclusive(`フォームを開いています: ${company.name}`, async () => {
      const b = await this.ensureBrowser();
      let page = this.formPages.get(key);
      if (!page || page.isClosed()) {
        page = await b.newPage();
        this.formPages.set(key, page);
      }
      const load = await page.open(url);
      if (!load.ok) throw new UserError(`フォームを開けませんでした（${load.error ?? 'アクセス制限の可能性'}）`);
      await page.bringToFront();
    });
    return url;
  }

  /** 人間が確認画面などへ進んだ後、いま開いているページを読み直す（アプリは画面を進めない） */
  async reanalyzeCurrent(key: string): Promise<void> {
    const { l, company } = this.find(key);
    const page = this.formPages.get(key);
    if (!page || page.isClosed()) throw new UserError('先に「フォームを開く（調査用Chrome）」を押してください');
    await this.exclusive(`現在ページを再解析: ${company.name}`, async () => {
      const raw = await page.readForms();
      const a = analyzeForms(raw);
      if (!a) throw new UserError('現在のページに入力欄が見つかりません（確認画面などの可能性があります）');
      const st = this.store(key, company);
      if (!st.research) throw new UserError('先に調査を実行してください');
      st.research = { ...st.research, form: await refineFormWithAI(a, this.currentAi()), steps: [...st.research.steps, '現在のページを再解析'] };
      this.rev++;
      l.progress.save();
    });
  }

  // ───────── 連続調査 ─────────

  /** @param limit 先頭から何社だけ調べるか（省略で最後まで） */
  startQueue(fromKey: string, limit?: number): void {
    const l = this.need();
    if (this.queue.running) throw new UserError('すでに連続調査が動いています');
    const start = Math.max(0, l.model.companies.findIndex((c) => c.key === fromKey));
    const n = limit && limit > 0 ? Math.floor(limit) : undefined;
    const keys = l.model.companies.slice(start, n ? start + n : undefined).map((c) => c.key);
    this.queue = { running: true, current: undefined, done: 0, total: keys.length, stop: false };
    void (async () => {
      for (const key of keys) {
        if (this.queue.stop) break;
        this.queue.current = key;
        const stored = this.loaded?.progress.current.companies[key];
        if (stored?.research) {
          this.queue.done++;
          continue; // 調査済みはスキップ（再調査したい場合は個別に実行）
        }
        try {
          await this.research(key, 'full');
        } catch (e) {
          void writeLog({ action: 'queue-error', ok: false, message: (e as Error).message });
        }
        this.queue.done++;
      }
      this.queue.running = false;
      this.queue.current = undefined;
    })();
  }

  stopQueue(): void {
    this.queue.stop = true;
    this.cancel.cancelled = true;
  }

  async shutdown(): Promise<void> {
    this.stopQueue();
    await this.loaded?.progress.flush();
    await this.closeBrowser();
  }

  get excelPath(): string | undefined {
    return this.loaded?.path;
  }

  normalizeJobKey(s: string): string {
    return normalizeKey(s);
  }
}
