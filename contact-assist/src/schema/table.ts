/** 表の見出し行を自動検出する */
import { DictEntry, matchDict, MatchStrength } from './dictionary';
import { isBlank, normalizeHeader } from './normalize';

export interface HeaderCandidate<K extends string> {
  row: number;
  columns: Partial<Record<K, number>>;
  texts: Partial<Record<K, string>>;
  strengths: Partial<Record<K, MatchStrength>>;
  /** 同じ強さで複数列に当たったキー（決められない） */
  ambiguous: Partial<Record<K, number[]>>;
  matched: K[];
  score: number;
  dataRows: number;
}

const MAX_HEADER_LEN = 24;
const DEFAULT_SCAN = 60;

export interface FindHeaderOptions<K extends string> {
  required: K[];
  weights: Partial<Record<K, number>>;
  maxScan?: number;
  /** 必須キーの最低強度（デフォルト1=弱語も可） */
  minStrength?: Partial<Record<K, MatchStrength>>;
}

export function scanHeaderRow<K extends string>(
  row: string[],
  dict: Record<K, DictEntry>,
  weights: Partial<Record<K, number>>,
): Omit<HeaderCandidate<K>, 'row' | 'dataRows'> {
  const hits = new Map<K, { col: number; strength: MatchStrength }[]>();
  row.forEach((cell, col) => {
    if (isBlank(cell)) return;
    const norm = normalizeHeader(cell);
    if (!norm || norm.length > MAX_HEADER_LEN) return;
    const m = matchDict(cell, dict);
    if (!m) return;
    const arr = hits.get(m.key) ?? [];
    arr.push({ col, strength: m.strength });
    hits.set(m.key, arr);
  });
  const columns: Partial<Record<K, number>> = {};
  const texts: Partial<Record<K, string>> = {};
  const strengths: Partial<Record<K, MatchStrength>> = {};
  const ambiguous: Partial<Record<K, number[]>> = {};
  const matched: K[] = [];
  let score = 0;
  for (const [key, arr] of hits) {
    const top = Math.max(...arr.map((a) => a.strength)) as MatchStrength;
    const tops = arr.filter((a) => a.strength === top);
    if (tops.length > 1) {
      ambiguous[key] = tops.map((t) => t.col);
      continue;
    }
    columns[key] = tops[0].col;
    texts[key] = row[tops[0].col];
    strengths[key] = top;
    matched.push(key);
    score += (weights[key] ?? 1) * (top === 3 ? 1 : top === 2 ? 0.8 : 0.5);
  }
  return { columns, texts, strengths, ambiguous, matched, score };
}

/** rows の先頭付近から、最も表の見出しらしい行を探す */
export function findHeader<K extends string>(
  rows: string[][],
  dict: Record<K, DictEntry>,
  opts: FindHeaderOptions<K>,
): HeaderCandidate<K> | null {
  const limit = Math.min(rows.length, opts.maxScan ?? DEFAULT_SCAN);
  let best: HeaderCandidate<K> | null = null;
  for (let r = 0; r < limit; r++) {
    const s = scanHeaderRow(rows[r], dict, opts.weights);
    const okRequired = opts.required.every((k) => {
      const col = s.columns[k];
      if (col === undefined) return false;
      const need = opts.minStrength?.[k] ?? 1;
      return (s.strengths[k] ?? 0) >= need;
    });
    if (!okRequired) continue;
    // 見出しの下にデータがあるか
    let dataRows = 0;
    for (let rr = r + 1; rr < rows.length; rr++) {
      const hasData = opts.required.some((k) => !isBlank(rows[rr][s.columns[k]!] ?? ''));
      if (hasData) dataRows++;
    }
    if (dataRows === 0) continue;
    const cand: HeaderCandidate<K> = { ...s, row: r, dataRows };
    if (!best || cand.score > best.score + 1e-9) best = cand;
  }
  return best;
}

/** 行列を転置する（文面が横並びのExcel用） */
export function transpose(rows: string[][]): string[][] {
  const width = Math.max(0, ...rows.map((r) => r.length));
  const out: string[][] = [];
  for (let c = 0; c < width; c++) out.push(rows.map((r) => r[c] ?? ''));
  return out;
}
