/** 企業一覧の取り出し。Excel上の並び順をそのまま保つ。 */
import type { Company, CompanyTableInfo, RawSheet } from '../shared/types';
import { isBlank, normalizeHeader } from '../schema/normalize';
import { looksLikeUrl } from './url';

export interface CompanyExtract {
  companies: Company[];
  /** 企業名が空など、取り込めなかった行 */
  skipped: { excelRow: number; reason: string }[];
}

export function extractCompanies(sheet: RawSheet, info: CompanyTableInfo): CompanyExtract {
  const companies: Company[] = [];
  const skipped: CompanyExtract['skipped'] = [];
  const cols = info.columns;
  const seen = new Map<string, number>();
  const headerNameNorm = normalizeHeader(info.headerTexts.name ?? '');

  const cell = (r: number, key: keyof typeof cols): string => {
    const c = cols[key];
    return c === undefined ? '' : (sheet.rows[r][c] ?? '');
  };

  for (let r = info.headerRow + 1; r < sheet.rows.length; r++) {
    const mapped = (Object.keys(cols) as (keyof typeof cols)[]).map((k) => cell(r, k));
    if (mapped.every(isBlank)) continue;
    const name = cell(r, 'name');
    if (isBlank(name)) {
      skipped.push({ excelRow: r + 1, reason: '企業名が空' });
      continue;
    }
    if (headerNameNorm && normalizeHeader(name) === headerNameNorm) continue; // 見出しの再掲

    let url = cell(r, 'url');
    const link = cols.url !== undefined ? sheet.meta[`${r},${cols.url}`]?.hyperlink : undefined;
    if (link && !looksLikeUrl(url)) url = link; // 表示テキストがURLでない場合のみリンク先を使う

    const baseKey = name.normalize('NFKC').trim();
    const n = (seen.get(baseKey) ?? 0) + 1;
    seen.set(baseKey, n);
    companies.push({
      key: n === 1 ? baseKey : `${baseKey}#${n}`,
      order: companies.length,
      excelRow: r + 1,
      name,
      url,
      industry: cell(r, 'industry'),
      excelJob: cell(r, 'job'),
      excelMemo: cell(r, 'memo'),
      excelTemplateNo: cell(r, 'templateNo'),
      excelJudgement: cell(r, 'judgement'),
    });
  }
  return { companies, skipped };
}
