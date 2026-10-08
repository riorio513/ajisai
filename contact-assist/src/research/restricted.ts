/** 採用支援の営業先として使えない「特定の人専用」フォームの判定（ルールベース） */
import type { FormAnalysis } from '../shared/types';

const RESTRICTED = /患者|求職者|応募者|応募フォーム|エントリーフォーム|採用エントリー|会員(様)?(専用|限定|の方|向け)|既存(の)?(お客様|顧客)|ご?契約者|株主|予約|ご?購入者|取引先(様)?(専用|向け|各位)|障害(報告|情報)|不具合(報告)|入居者|保護者|受講生|加盟店|代理店様専用|オーナー様専用|利用者様専用|診察|宿泊予約|お支払い/;
const FIELD_RESTRICTED = /診察券|会員番号|契約(者)?番号|お客様番号|注文番号|顧客番号|患者|学籍番号|受験番号|予約番号|応募職種|希望職種|履歴書/;

export interface Eligibility {
  kind: 'general' | 'restricted' | 'unclear';
  reason: string;
}

export function classifyEligibility(a: Pick<FormAnalysis, 'title' | 'headings' | 'url' | 'frameUrl' | 'fields' | 'noticeText'>): Eligibility {
  let path = '';
  try {
    path = decodeURIComponent(new URL(a.url).pathname);
  } catch {
    /* ignore */
  }
  const strong = [a.title, ...a.headings, path].join(' ');
  const m = RESTRICTED.exec(strong);
  if (m) return { kind: 'restricted', reason: `ページのタイトル・見出し・URLに「${m[0]}」とあり、特定の人向けのフォームと判断しました` };
  const required = a.fields.filter((f) => f.conditions.required === true);
  for (const f of required) {
    const fm = FIELD_RESTRICTED.exec(`${f.displayLabel} ${f.raw.name}`);
    if (fm) return { kind: 'restricted', reason: `必須項目に「${fm[0]}」があり、特定の人向けのフォームと判断しました` };
  }
  const head = a.noticeText.slice(0, 300);
  const hm = RESTRICTED.exec(head) ?? /(の方|様)(専用|限定)/.exec(head);
  if (hm) return { kind: 'unclear', reason: `フォーム冒頭に「${hm[0]}」の記載があります` };
  return { kind: 'general', reason: '特定の人向けを示す記載は見つかりませんでした' };
}
