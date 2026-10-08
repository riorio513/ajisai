/**
 * Excel を読み込んだ結果（アプリが「現在の正」として扱うデータ）を組み立てる。
 * 過去の内容は一切埋め込まない。毎回、実際の Excel から作り直す。
 */
import type { Company, MasterData, QualityIssue, RawWorkbook, StructureResult, Template, UserMapping } from '../shared/types';
import { extractCompanies } from '../excel/companies';
import { extractTemplates, jobOptions, JobOption } from '../templates/extract';
import { buildMaster } from '../master-data/build';
import { scanMaster } from '../master-data/scan';
import { checkQuality } from '../validation/quality';
import { analyzeStructure } from './analyze';

export interface WorkbookModel {
  structure: StructureResult;
  companies: Company[];
  templates: Template[];
  jobs: JobOption[];
  master: MasterData | null;
  quality: QualityIssue[];
}

export interface ModelOptions {
  mapping?: UserMapping;
  masterOverrides?: Record<string, string>;
}

export function buildModel(raw: RawWorkbook, opts: ModelOptions = {}): WorkbookModel {
  const a = analyzeStructure(raw, opts.mapping ?? {});
  const sheetByName = (n: string) => raw.sheets.find((s) => s.name === n);

  let companies: Company[] = [];
  let skipped: { excelRow: number; reason: string }[] = [];
  if (a.companyTable) {
    const sh = sheetByName(a.companyTable.sheet)!;
    const r = extractCompanies(sh, a.companyTable);
    companies = r.companies;
    skipped = r.skipped;
  }
  let templates: Template[] = [];
  if (a.templateTable) templates = extractTemplates(sheetByName(a.templateTable.sheet)!, a.templateTable);

  let master: MasterData | null = null;
  if (a.masterSheet) {
    const sh = sheetByName(a.masterSheet)!;
    const scan = scanMaster(sh);
    master = buildMaster(scan.entries, scan.unclassified, sh.name, { overrides: opts.masterOverrides });
    if (scan.problem) {
      a.structure.problems.push({ role: 'master', message: scan.problem });
      a.structure.status = 'needs-confirmation';
    }
  }

  const quality = checkQuality({ companies, skippedCompanies: skipped, templates, master });
  return { structure: a.structure, companies, templates, jobs: jobOptions(templates), master, quality };
}
