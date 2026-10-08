/** Excel 読込直後のデータ品質チェック。致命的でないものは警告にとどめ、アプリは止めない。 */
import type { Company, MasterData, QualityIssue, Template } from '../shared/types';
import { isBlank } from '../schema/normalize';
import { looksLikeUrl, toNavigableUrl } from '../excel/url';

export function checkQuality(input: {
  companies: Company[];
  skippedCompanies: { excelRow: number; reason: string }[];
  templates: Template[];
  master: MasterData | null;
}): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const { companies, templates, master } = input;

  for (const s of input.skippedCompanies) {
    issues.push({ severity: 'warning', code: 'company-name-empty', message: `企業名が空の行があります（取り込みません）`, where: `${s.excelRow}行目` });
  }
  if (companies.length === 0) {
    issues.push({ severity: 'error', code: 'no-companies', message: '企業が1社も読み込めませんでした' });
  }

  // 企業重複
  const byName = new Map<string, Company[]>();
  for (const c of companies) {
    const k = c.name.normalize('NFKC').replace(/[\s　]+/g, '');
    byName.set(k, [...(byName.get(k) ?? []), c]);
  }
  for (const list of byName.values()) {
    if (list.length > 1) {
      issues.push({
        severity: 'warning', code: 'company-duplicate',
        message: `企業名が重複しています: ${list[0].name}`, where: list.map((c) => `${c.excelRow}行目`).join(', '),
      });
    }
  }
  for (const c of companies) {
    if (c.name !== c.name.trim()) {
      issues.push({ severity: 'info', code: 'company-name-space', message: `企業名の前後に空白があります（そのまま使用します）: 「${c.name}」`, where: `${c.excelRow}行目` });
    }
    if (!isBlank(c.url)) {
      if (!looksLikeUrl(c.url) || !toNavigableUrl(c.url)) {
        issues.push({ severity: 'warning', code: 'url-format', message: `URLの形式が不正です: ${c.url}`, where: `${c.excelRow}行目（${c.name}）` });
      }
    }
  }

  // 文面
  if (templates.length === 0) issues.push({ severity: 'error', code: 'no-templates', message: '文面が1件も読み込めませんでした' });
  const numbers = new Map<string, Template[]>();
  const jobs = new Map<string, Template[]>();
  for (const t of templates) {
    if (!isBlank(t.number)) numbers.set(t.number.trim(), [...(numbers.get(t.number.trim()) ?? []), t]);
    if (!isBlank(t.job)) {
      const k = t.job.normalize('NFKC').replace(/[\s　]+/g, '');
      jobs.set(k, [...(jobs.get(k) ?? []), t]);
    }
    if (isBlank(t.subject)) issues.push({ severity: 'warning', code: 'template-subject-missing', message: `文面の件名が空です（${t.number || t.job}）`, where: t.where });
    if (isBlank(t.body)) issues.push({ severity: 'error', code: 'template-body-missing', message: `文面の本文が空です（${t.number || t.job}）`, where: t.where });
    if (isBlank(t.job)) issues.push({ severity: 'warning', code: 'template-job-missing', message: `文面の職種が空です（${t.number || t.body.slice(0, 10)}）`, where: t.where });
  }
  for (const [n, list] of numbers) {
    if (list.length > 1) issues.push({ severity: 'error', code: 'template-number-duplicate', message: `文面番号が重複しています: ${n}`, where: list.map((t) => t.where).join(', ') });
  }
  for (const list of jobs.values()) {
    if (list.length > 1) {
      issues.push({ severity: 'warning', code: 'template-job-duplicate', message: `同じ職種の文面が複数あります: ${list[0].job}（この職種を選ぶ場合は文面を手動で選んでください）`, where: list.map((t) => t.where).join(', ') });
    }
  }

  // 問い合わせ情報
  if (!master) {
    issues.push({ severity: 'error', code: 'no-master', message: '問い合わせ情報（送信者情報）が読み込めませんでした' });
  } else {
    for (const c of master.conflicts) issues.push({ severity: 'error', code: 'master-conflict', message: c.title });
    const need: [keyof MasterData['values'], string][] = [['companyName', '会社名'], ['email', 'メールアドレス'], ['phone', '電話番号']];
    for (const [k, label] of need) {
      const hasValue = master.values[k] !== undefined || master.conflicts.some((c) => c.fieldGroup.endsWith(`:${k}`));
      if (!hasValue && !(k === 'phone' && master.values.phone1 !== undefined)) {
        issues.push({ severity: 'warning', code: 'master-missing', message: `問い合わせ情報に「${label}」がありません（フォームで必須の場合は入力必須データ不足になります）` });
      }
    }
    if (master.values.fullName === undefined && (master.values.lastName === undefined || master.values.firstName === undefined)) {
      issues.push({ severity: 'warning', code: 'master-missing', message: '問い合わせ情報に氏名（または姓・名）がありません' });
    }
  }
  return issues;
}
