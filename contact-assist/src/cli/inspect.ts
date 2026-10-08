/**
 * Excelの構造をどう認識したかを一覧表示する診断ツール。
 *   npm run inspect -- "C:\path\to\file.xlsx"          （個人情報は伏せ字）
 *   npm run inspect -- "C:\path\to\file.xlsx" --show-values
 */
import { readWorkbookFromFile } from '../excel/reader';
import { buildModel } from '../schema/model';

function mask(s: string): string {
  if (s.length <= 4) return '****';
  return s.slice(0, 2) + '*'.repeat(Math.min(10, s.length - 4)) + s.slice(-2);
}

async function main() {
  const args = process.argv.slice(2);
  const show = args.includes('--show-values');
  const path = args.find((a) => !a.startsWith('--'));
  if (!path) {
    console.error('使い方: npm run inspect -- <Excelファイル> [--show-values]');
    process.exit(1);
  }
  const raw = await readWorkbookFromFile(path.replace(/^["']|["']$/g, ''));
  const m = buildModel(raw);
  const roleName = { company: '企業一覧', master: '問い合わせ情報', templates: '文面一覧', unknown: '不明' } as const;

  console.log('■ シート');
  for (const s of m.structure.sheets) {
    console.log(`  - ${s.name}: ${roleName[s.role]}（企業${s.scores.company} / 情報${s.scores.master} / 文面${s.scores.templates}）`);
  }
  console.log(`■ 判定: ${m.structure.status === 'ok' ? 'OK（自動認識できました）' : 'Excel構造確認が必要'}`);
  for (const p of m.structure.problems) console.log(`  ! ${p.message}${p.candidates ? ` 候補: ${p.candidates.join(', ')}` : ''}`);
  const ct = m.structure.companyTable;
  if (ct) console.log(`■ 企業一覧: シート「${ct.sheet}」 見出し${ct.headerRow + 1}行目 列=${JSON.stringify(ct.headerTexts)} → ${m.companies.length}社`);
  const tt = m.structure.templateTable;
  if (tt) console.log(`■ 文面一覧: シート「${tt.sheet}」 ${tt.orientation === 'rows' ? '縦並び' : '横並び'} 見出し${tt.headerRow + 1} 列=${JSON.stringify(tt.headerTexts)} → ${m.templates.length}件 / 職種${m.jobs.length}種類`);
  for (const t of m.templates) console.log(`    [${t.number || '-'}] ${t.job}  件名${t.subject.length}字 本文${t.body.length}字`);
  if (m.master) {
    console.log(`■ 問い合わせ情報: シート「${m.master.sheet}」`);
    for (const [k, v] of Object.entries(m.master.values)) console.log(`    ${k}: ${show ? v : mask(String(v))}`);
    for (const c of m.master.conflicts) console.log(`  ! 矛盾: ${c.title} → ${c.candidates.map((x) => (show ? x.display : mask(x.display))).join(' / ')}`);
    if (m.master.unclassified.length) console.log(`    （分類できなかったラベル: ${m.master.unclassified.map((u) => u.label).join(', ')}）`);
  }
  console.log('■ データ品質');
  if (m.quality.length === 0) console.log('    問題は見つかりませんでした');
  for (const q of m.quality) console.log(`    [${q.severity}] ${q.message}${q.where ? `（${q.where}）` : ''}`);
}
void main();
