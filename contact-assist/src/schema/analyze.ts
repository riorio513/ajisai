/**
 * Excel の全シートを走査して、各シートの役割（企業一覧 / 問い合わせ情報 / 文面）と
 * 見出し位置・列の意味を自動判定する。シート名・列番号・行番号は固定しない。
 */
import type {
  CompanyColumn, CompanyTableInfo, RawWorkbook, SheetAnalysis, SheetMappingSpec, SheetRole,
  StructureProblem, StructureResult, TemplateColumn, TemplateTableInfo, UserMapping,
} from '../shared/types';
import { COMPANY_DICT, SHEET_NAME_HINTS, TEMPLATE_DICT } from './dictionary';
import { findHeader, HeaderCandidate, scanHeaderRow, transpose } from './table';
import { hashString, isBlank, normalizeHeader } from './normalize';
import { scanMaster } from '../master-data/scan';

export const THRESHOLD = { company: 5, templates: 7, master: 6 } as const;

const COMPANY_WEIGHTS: Partial<Record<CompanyColumn, number>> = { name: 5, url: 2, industry: 1, job: 1, memo: 1, templateNo: 1, judgement: 1 };
const TEMPLATE_WEIGHTS: Partial<Record<TemplateColumn, number>> = { body: 5, subject: 3, job: 2, number: 2, target: 1, price: 1 };

function nameHint(role: 'company' | 'master' | 'templates', sheetName: string): number {
  const n = normalizeHeader(sheetName);
  return SHEET_NAME_HINTS[role].some((h) => n.includes(normalizeHeader(h))) ? 1 : 0;
}

function companyInfo(sheetName: string, h: HeaderCandidate<CompanyColumn>): CompanyTableInfo {
  return { sheet: sheetName, headerRow: h.row, columns: { ...h.columns }, headerTexts: { ...h.texts } };
}

function templateInfo(sheetName: string, h: HeaderCandidate<TemplateColumn>, orientation: 'rows' | 'columns'): TemplateTableInfo {
  return { sheet: sheetName, orientation, headerRow: h.row, columns: { ...h.columns }, headerTexts: { ...h.texts } };
}

interface Detected {
  company: { info: CompanyTableInfo; score: number } | null;
  templates: { info: TemplateTableInfo; score: number } | null;
  master: { score: number } | null;
}

function detectSheet(sheet: RawWorkbook['sheets'][number]): Detected {
  const out: Detected = { company: null, templates: null, master: null };

  const ch = findHeader<CompanyColumn>(sheet.rows, COMPANY_DICT, { required: ['name'], weights: COMPANY_WEIGHTS, minStrength: { name: 2 } });
  if (ch) out.company = { info: companyInfo(sheet.name, ch), score: ch.score + Math.min(ch.dataRows, 10) / 10 + nameHint('company', sheet.name) };

  let best: { info: TemplateTableInfo; score: number } | null = null;
  for (const orientation of ['rows', 'columns'] as const) {
    const grid = orientation === 'rows' ? sheet.rows : transpose(sheet.rows);
    const th = findHeader<TemplateColumn>(grid, TEMPLATE_DICT, { required: ['body'], weights: TEMPLATE_WEIGHTS, minStrength: { body: 1 } });
    if (!th) continue;
    // 弱い語（「文面」だけ）で本文列とみなすのは、件名列もある場合のみ
    if ((th.strengths.body ?? 0) < 2 && th.columns.subject === undefined) continue;
    const score = th.score + Math.min(th.dataRows, 10) / 10 + nameHint('templates', sheet.name);
    if (!best || score > best.score) best = { info: templateInfo(sheet.name, th, orientation), score };
  }
  out.templates = best;

  const m = scanMaster(sheet);
  if (m.score > 0) out.master = { score: m.score + nameHint('master', sheet.name) };
  return out;
}

function bestRole(d: Detected): { role: SheetRole; ambiguous: boolean } {
  const cands: { role: SheetRole; score: number }[] = [];
  if (d.company && d.company.score >= THRESHOLD.company) cands.push({ role: 'company', score: d.company.score });
  if (d.templates && d.templates.score >= THRESHOLD.templates) cands.push({ role: 'templates', score: d.templates.score });
  if (d.master && d.master.score >= THRESHOLD.master) cands.push({ role: 'master', score: d.master.score });
  if (cands.length === 0) return { role: 'unknown', ambiguous: false };
  cands.sort((a, b) => b.score - a.score);
  if (cands.length > 1 && cands[0].score - cands[1].score < 1) return { role: 'unknown', ambiguous: true };
  return { role: cands[0].role, ambiguous: false };
}

// ───────── 保存済みマッピングの再検証 ─────────

/** 見出し文字列で列を引き直す。見つからない/曖昧なら null（盲目的に使わない） */
function resolveSpecInRows<K extends string>(
  rows: string[][],
  spec: SheetMappingSpec,
): { row: number; columns: Partial<Record<K, number>>; texts: Partial<Record<K, string>> } | null {
  const fields = Object.keys(spec.headers) as K[];
  const limit = Math.min(rows.length, 80);
  for (let r = 0; r < limit; r++) {
    const columns: Partial<Record<K, number>> = {};
    const texts: Partial<Record<K, string>> = {};
    let ok = true;
    for (const f of fields) {
      const want = normalizeHeader(spec.headers[f]);
      const hits = rows[r].map((c, i) => ({ c, i })).filter((x) => !isBlank(x.c) && normalizeHeader(x.c) === want);
      const occ = spec.occ?.[f] ?? 0;
      if (hits.length === 0 || hits.length <= occ && occ > 0) {
        ok = false;
        break;
      }
      if (hits.length > 1 && spec.occ?.[f] === undefined) {
        ok = false; // 同名の見出しが複数あり、どれか不明
        break;
      }
      columns[f] = hits[occ].i;
      texts[f] = rows[r][hits[occ].i];
    }
    if (ok && fields.length > 0) return { row: r, columns, texts };
  }
  return null;
}

export interface AnalyzeResult {
  structure: StructureResult;
  companyTable?: CompanyTableInfo;
  templateTable?: TemplateTableInfo;
  masterSheet?: string;
}

export function analyzeStructure(wb: RawWorkbook, saved: UserMapping = {}): AnalyzeResult {
  const sheets: SheetAnalysis[] = [];
  const detected = new Map<string, Detected>();
  const problems: StructureProblem[] = [];
  const mappingNotes: string[] = [];
  const usedSaved = { company: false, templates: false, master: false };

  for (const sh of wb.sheets) {
    const d = detectSheet(sh);
    detected.set(sh.name, d);
    const { role, ambiguous } = bestRole(d);
    sheets.push({
      name: sh.name,
      index: sh.index,
      rowCount: sh.rows.length,
      colCount: Math.max(0, ...sh.rows.map((r) => r.length)),
      role,
      scores: { company: round(d.company?.score ?? 0), master: round(d.master?.score ?? 0), templates: round(d.templates?.score ?? 0) },
      note: ambiguous ? '複数の役割に同程度に当てはまるため、役割を決められません' : undefined,
    });
  }

  let companyTable: CompanyTableInfo | undefined;
  let templateTable: TemplateTableInfo | undefined;
  let masterSheet: string | undefined;

  // 1) 保存済みマッピング（再検証して使えるときだけ使う）
  if (saved.company) {
    const sh = wb.sheets.find((s) => s.name === saved.company!.sheet);
    const r = sh ? resolveSpecInRows<CompanyColumn>(sh.rows, saved.company) : null;
    if (sh && r && r.columns.name !== undefined) {
      companyTable = { sheet: sh.name, headerRow: r.row, columns: r.columns, headerTexts: r.texts };
      usedSaved.company = true;
      mappingNotes.push(`企業一覧: 保存済みの設定（シート「${sh.name}」）を再検証して使用しました`);
    } else {
      mappingNotes.push('企業一覧: 保存済みの設定が現在のExcelと一致しないため、自動判定をやり直しました');
    }
  }
  if (saved.templates) {
    const sh = wb.sheets.find((s) => s.name === saved.templates!.sheet);
    const orientation = saved.templates.orientation ?? 'rows';
    const grid = sh ? (orientation === 'rows' ? sh.rows : transpose(sh.rows)) : null;
    const r = grid ? resolveSpecInRows<TemplateColumn>(grid, saved.templates) : null;
    if (sh && r && r.columns.body !== undefined && r.columns.job !== undefined) {
      templateTable = { sheet: sh.name, orientation, headerRow: r.row, columns: r.columns, headerTexts: r.texts };
      usedSaved.templates = true;
      mappingNotes.push(`文面一覧: 保存済みの設定（シート「${sh.name}」）を再検証して使用しました`);
    } else {
      mappingNotes.push('文面一覧: 保存済みの設定が現在のExcelと一致しないため、自動判定をやり直しました');
    }
  }
  if (saved.master) {
    const sh = wb.sheets.find((s) => s.name === saved.master!.sheet);
    if (sh && scanMaster(sh).score > 0) {
      masterSheet = sh.name;
      usedSaved.master = true;
      mappingNotes.push(`問い合わせ情報: 保存済みの設定（シート「${sh.name}」）を再検証して使用しました`);
    } else {
      mappingNotes.push('問い合わせ情報: 保存済みの設定が現在のExcelと一致しないため、自動判定をやり直しました');
    }
  }

  // 2) 自動判定
  const roleSheets = (role: SheetRole) => sheets.filter((s) => s.role === role);
  if (!companyTable) {
    const c = roleSheets('company');
    if (c.length === 1) companyTable = detected.get(c[0].name)!.company!.info;
    else problems.push({ role: 'company', message: c.length === 0 ? '企業一覧のシートを特定できません' : '企業一覧の候補が複数あり、決められません', candidates: c.map((x) => x.name) });
  }
  if (!templateTable) {
    const t = roleSheets('templates');
    if (t.length === 1) {
      templateTable = detected.get(t[0].name)!.templates!.info;
      if (templateTable.columns.job === undefined) {
        problems.push({ role: 'templates', message: '文面一覧に「職種」にあたる列が見つかりません' });
        templateTable = undefined;
      }
    } else problems.push({ role: 'templates', message: t.length === 0 ? '文面一覧のシートを特定できません' : '文面一覧の候補が複数あり、決められません', candidates: t.map((x) => x.name) });
  }
  if (!masterSheet) {
    const m = roleSheets('master');
    if (m.length === 1) masterSheet = m[0].name;
    else problems.push({ role: 'master', message: m.length === 0 ? '問い合わせ情報（送信者情報）のシートを特定できません' : '問い合わせ情報の候補が複数あり、決められません', candidates: m.map((x) => x.name) });
  }
  if (companyTable && companyTable.columns.name === undefined) {
    problems.push({ role: 'company', message: '企業名の列を特定できません' });
  }

  // 決定した役割をシート一覧に反映
  for (const s of sheets) {
    if (companyTable?.sheet === s.name && s.role === 'unknown') s.role = 'company';
    if (templateTable?.sheet === s.name && s.role === 'unknown') s.role = 'templates';
    if (masterSheet === s.name && s.role === 'unknown') s.role = 'master';
  }

  const fingerprint = hashString(JSON.stringify({
    sheets: sheets.map((s) => [s.name, s.role]),
    c: companyTable?.headerTexts,
    t: templateTable?.headerTexts,
    m: masterSheet,
  }));

  const structure: StructureResult = {
    status: problems.length === 0 ? 'ok' : 'needs-confirmation',
    fingerprint,
    sheets,
    companyTable,
    templateTable,
    masterSheet,
    problems,
    mappingNotes,
    usedSavedMapping: usedSaved,
  };
  return { structure, companyTable, templateTable, masterSheet };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** マッピング画面で選ばれた列から、保存用のスペックを作る */
export function buildSpec(
  rows: string[][],
  sheet: string,
  headerRow: number,
  columns: Record<string, number>,
): SheetMappingSpec {
  const headers: Record<string, string> = {};
  const occ: Record<string, number> = {};
  for (const [field, col] of Object.entries(columns)) {
    const text = rows[headerRow]?.[col] ?? '';
    headers[field] = text;
    const norm = normalizeHeader(text);
    let n = 0;
    for (let c = 0; c < col; c++) if (!isBlank(rows[headerRow][c]) && normalizeHeader(rows[headerRow][c]) === norm) n++;
    occ[field] = n;
  }
  return { sheet, headers, occ };
}

export { scanHeaderRow };
