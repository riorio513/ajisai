/** 文面テンプレート一覧の取り出し。件名・本文は Excel 原文のまま保持する（加工しない）。 */
import type { RawSheet, Template, TemplateTableInfo } from '../shared/types';
import { colName, isBlank } from '../schema/normalize';
import { transpose } from '../schema/table';

export function extractTemplates(sheet: RawSheet, info: TemplateTableInfo): Template[] {
  const rotated = info.orientation === 'columns';
  const grid = rotated ? transpose(sheet.rows) : sheet.rows;
  const cols = info.columns;
  const out: Template[] = [];
  const seen = new Map<string, number>();

  for (let r = info.headerRow + 1; r < grid.length; r++) {
    const raw = (k: keyof typeof cols): string => {
      const c = cols[k];
      return c === undefined ? '' : (grid[r][c] ?? '');
    };
    const mapped = (Object.keys(cols) as (keyof typeof cols)[]).map(raw);
    if (mapped.every(isBlank)) continue;

    const number = raw('number');
    const job = raw('job');
    const baseId = (number.trim() || job.trim() || `位置${r + 1}`).normalize('NFKC');
    const n = (seen.get(baseId) ?? 0) + 1;
    seen.set(baseId, n);
    out.push({
      id: n === 1 ? baseId : `${baseId}#${n}`,
      excelRow: r + 1,
      where: rotated ? `${colName(r)}列` : `${r + 1}行目`,
      number,
      job,
      target: raw('target'),
      price: raw('price'),
      subject: raw('subject'),
      body: raw('body'),
    });
  }
  return out;
}

export interface JobOption {
  /** 職種表示（Excelの文字列そのまま） */
  label: string;
  templateIds: string[];
}

/** 現在のExcelの文面データから使用可能な職種一覧を作る（Excelに無い職種は作らない） */
export function jobOptions(templates: Template[]): JobOption[] {
  const map = new Map<string, JobOption>();
  for (const t of templates) {
    if (isBlank(t.job)) continue;
    const key = t.job.normalize('NFKC').replace(/[\s　]+/g, '');
    const cur = map.get(key);
    if (cur) cur.templateIds.push(t.id);
    else map.set(key, { label: t.job.trim(), templateIds: [t.id] });
  }
  return [...map.values()];
}
