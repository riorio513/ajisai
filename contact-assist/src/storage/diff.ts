/** Excel再読込時の差分検出。変更された部分の保存済み結果（キャッシュ）を無効化するために使う。 */
import type { Company, Template } from '../shared/types';
import { hashString } from '../schema/normalize';
import type { Snapshot } from './progress';

export function makeSnapshot(input: { fingerprint: string; companies: Company[]; templates: Template[]; masterValues: unknown }): Snapshot {
  return {
    fingerprint: input.fingerprint,
    companies: input.companies.map((c) => ({ key: c.key, name: c.name, url: c.url, row: c.excelRow })),
    templates: input.templates.map((t) => ({ id: t.id, number: t.number, job: t.job, subjectHash: hashString(t.subject), bodyHash: hashString(t.body) })),
    masterHash: hashString(JSON.stringify(input.masterValues ?? null)),
  };
}

export interface ExcelDiff {
  changed: boolean;
  structureChanged: boolean;
  companiesAdded: string[];
  companiesRemoved: string[];
  companiesRenamed: { from: string; to: string }[];
  urlChanged: { name: string; from: string; to: string }[];
  templatesAdded: string[];
  templatesRemoved: string[];
  templatesChanged: { id: string; what: string[] }[];
  masterChanged: boolean;
  /** 結果を無効化すべき企業キー */
  invalidate: string[];
  messages: string[];
}

export function diffSnapshots(prev: Snapshot | undefined, next: Snapshot): ExcelDiff {
  const empty: ExcelDiff = {
    changed: false, structureChanged: false, companiesAdded: [], companiesRemoved: [], companiesRenamed: [], urlChanged: [], templatesAdded: [],
    templatesRemoved: [], templatesChanged: [], masterChanged: false, invalidate: [], messages: [],
  };
  if (!prev) return empty;
  const d = { ...empty };
  d.structureChanged = prev.fingerprint !== next.fingerprint;
  const pc = new Map(prev.companies.map((c) => [c.key, c]));
  const nc = new Map(next.companies.map((c) => [c.key, c]));
  const added = next.companies.filter((c) => !pc.has(c.key));
  const removed = prev.companies.filter((c) => !nc.has(c.key));
  // 同じURLで名前だけ違う → 企業名変更
  const renamedFrom = new Set<string>();
  for (const a of added) {
    const r = removed.find((x) => x.url && x.url === a.url && !renamedFrom.has(x.key));
    if (r) {
      d.companiesRenamed.push({ from: r.name, to: a.name });
      renamedFrom.add(r.key);
    }
  }
  d.companiesAdded = added.filter((a) => !d.companiesRenamed.some((r) => r.to === a.name)).map((c) => c.name);
  d.companiesRemoved = removed.filter((r) => !renamedFrom.has(r.key)).map((c) => c.name);
  for (const [k, c] of nc) {
    const p = pc.get(k);
    if (p && p.url !== c.url) {
      d.urlChanged.push({ name: c.name, from: p.url, to: c.url });
      d.invalidate.push(k);
    }
  }
  for (const r of removed) d.invalidate.push(r.key);

  const pt = new Map(prev.templates.map((t) => [t.id, t]));
  const nt = new Map(next.templates.map((t) => [t.id, t]));
  d.templatesAdded = [...nt.keys()].filter((k) => !pt.has(k));
  d.templatesRemoved = [...pt.keys()].filter((k) => !nt.has(k));
  for (const [id, t] of nt) {
    const p = pt.get(id);
    if (!p) continue;
    const what: string[] = [];
    if (p.job !== t.job) what.push('職種');
    if (p.subjectHash !== t.subjectHash) what.push('件名');
    if (p.bodyHash !== t.bodyHash) what.push('本文');
    if (p.number !== t.number) what.push('番号');
    if (what.length) d.templatesChanged.push({ id, what });
  }
  d.masterChanged = prev.masterHash !== next.masterHash;

  const msg = d.messages;
  if (d.structureChanged) msg.push('Excelの構造（シート・列の構成）が前回と変わっています');
  if (d.companiesAdded.length) msg.push(`企業が追加されました: ${d.companiesAdded.slice(0, 5).join('、')}${d.companiesAdded.length > 5 ? ` ほか${d.companiesAdded.length - 5}社` : ''}`);
  if (d.companiesRemoved.length) msg.push(`企業が削除されました: ${d.companiesRemoved.slice(0, 5).join('、')}`);
  for (const r of d.companiesRenamed) msg.push(`企業名が変更されました: ${r.from} → ${r.to}`);
  for (const u of d.urlChanged) msg.push(`URLが変更されました（調査結果を破棄）: ${u.name}`);
  if (d.templatesAdded.length) msg.push(`文面が追加されました: ${d.templatesAdded.join('、')}`);
  if (d.templatesRemoved.length) msg.push(`文面が削除されました: ${d.templatesRemoved.join('、')}`);
  for (const t of d.templatesChanged) msg.push(`文面「${t.id}」の${t.what.join('・')}が変更されました（以後は新しい内容を使用します）`);
  if (d.masterChanged) msg.push('問い合わせ情報（送信者情報）が変更されました（以後は新しい内容を使用します）');
  d.changed = msg.length > 0;
  return d;
}
