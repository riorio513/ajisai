/** サイト内リンクの分類・優先度付け */
import type { PageLink } from '../browser/session';

const SECOND_LEVEL = new Set(['co', 'or', 'ne', 'ac', 'go', 'ed', 'gr', 'lg', 'ad', 'com', 'net', 'org']);

/** 簡易的な登録ドメイン（example.co.jp / example.com） */
export function registrableDomain(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h === 'localhost') return h;
  const labels = h.split('.');
  if (labels.length >= 3 && labels[labels.length - 1].length === 2 && SECOND_LEVEL.has(labels[labels.length - 2])) return labels.slice(-3).join('.');
  return labels.slice(-2).join('.');
}

export function sameSite(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.hostname === ub.hostname) return true;
    return registrableDomain(ua.hostname) === registrableDomain(ub.hostname);
  } catch {
    return false;
  }
}

/** 外部のフォーム作成サービス（公式サイトのリンクから遷移する場合のみ許可） */
export const FORM_SERVICES = /(form\.run|formrun\.jp|forms\.gle|docs\.google\.com\/forms|hubspot|kintoneapp\.com|formzu\.net|jotform|typeform|tayori\.com|bizmw\.com|form-mailer|formmailer|secure\.[^/]+\/|cybozu\.com|ssl\.form-mailer|sakura\.ne\.jp\/form|contact-form|cognito|wufoo|fc2\.com\/form|webform|ws\.formzu|enq-maker|ex-form)/i;

const CONTACT_TEXT = /お問い?合わ?せ|問い?合わ?せ|contact|inquiry|enquiry|ご相談|相談窓口|法人のお客様|企業のお客様|法人様|法人のお問い合わせ|各種お問い合わせ|メールフォーム|お問合せ|toiawase/i;
const CONTACT_PATH = /\/(contact|inquiry|enquiry|toiawase|otoiawase|form|mailform|contact-us|contactus|support\/contact|ask)(\/|\.|$|\?)/i;
const FORM_WORD = /フォーム|form/i;
const NEGATIVE = /プライバシー|privacy|個人情報|ログイン|login|マイページ|ニュース|news|blog|ブログ|sitemap|サイトマップ|facebook|twitter|instagram|youtube|line\.me|\.pdf$/i;
const RESTRICTED_TEXT = /患者|求職|応募|株主|IR|予約|会員|エントリー|採用|求人|recruit|career|entry/i;

export interface ScoredLink {
  href: string;
  text: string;
  score: number;
  reason: string;
}

export function scoreContactLink(l: PageLink, base: string): ScoredLink | null {
  let score = 0;
  const why: string[] = [];
  let url: URL;
  try {
    url = new URL(l.href);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const inSite = sameSite(base, l.href);
  const text = `${l.text} ${l.title}`;
  const pathLike = decodeURIComponent(url.pathname) + url.search;
  if (CONTACT_TEXT.test(text)) {
    score += 10;
    why.push('リンク文言がお問い合わせ系');
  }
  if (FORM_WORD.test(text)) {
    score += 3;
    why.push('「フォーム」');
  }
  if (CONTACT_PATH.test(pathLike)) {
    score += 6;
    why.push('URLがcontact系');
  }
  if (score === 0) return null;
  if (!inSite && !(FORM_SERVICES.test(l.href) && CONTACT_TEXT.test(text))) return null;
  if (l.area === 'footer' || l.area === 'header' || l.area === 'nav') score += 1;
  if (NEGATIVE.test(text) || NEGATIVE.test(pathLike)) score -= 8;
  if (RESTRICTED_TEXT.test(text) && !CONTACT_TEXT.test(text.replace(RESTRICTED_TEXT, ''))) score -= 6;
  else if (RESTRICTED_TEXT.test(text)) score -= 3;
  if (score <= 0) return null;
  return { href: url.toString(), text: l.text, score, reason: why.join(' / ') };
}

const CAREER_TEXT = /採用|求人|recruit|career|募集|新卒|中途|jobs?\b|エントリー|キャリア|働く|仲間/i;
export function scoreCareerLink(l: PageLink, base: string): ScoredLink | null {
  if (!sameSite(base, l.href)) return null;
  let url: URL;
  try {
    url = new URL(l.href);
  } catch {
    return null;
  }
  const text = `${l.text} ${l.title}`;
  let score = 0;
  if (CAREER_TEXT.test(text)) score += 8;
  if (/\/(recruit|career|careers|jobs?|saiyo|entry)(\/|\.|$)/i.test(url.pathname)) score += 5;
  if (/募集要項|募集職種|採用情報|求人情報/.test(text)) score += 3;
  if (score === 0 || /プライバシー|privacy|個人情報/.test(text)) return null;
  return { href: url.toString(), text: l.text, score, reason: '採用ページらしいリンク' };
}

const NOTICE_TEXT = /利用規約|ご利用(にあたって|上の注意|ガイド|について)|サイトのご利用|注意事項|お問い合わせ(に関する|の前に|について|前の)|お問い合わせ前|ご注意|サイトポリシー|免責|よくある(ご)?質問|FAQ|ご確認ください/i;
export function scoreNoticeLink(l: PageLink, base: string): ScoredLink | null {
  if (!sameSite(base, l.href)) return null;
  const text = `${l.text} ${l.title}`;
  if (!NOTICE_TEXT.test(text) || /プライバシー|個人情報|privacy/i.test(text)) return null;
  return { href: l.href, text: l.text, score: /利用規約|ご注意|注意事項|お問い合わせ(に関する|の前に|について)/.test(text) ? 8 : 4, reason: '注意書き・規約系のリンク' };
}

const ABOUT_TEXT = /会社概要|企業情報|会社案内|about|company|corporate|事業内容|サービス|事業紹介|沿革/i;
export function scoreAboutLink(l: PageLink, base: string): ScoredLink | null {
  if (!sameSite(base, l.href)) return null;
  const text = `${l.text} ${l.title}`;
  if (!ABOUT_TEXT.test(text)) return null;
  return { href: l.href, text: l.text, score: /会社概要|企業情報|事業内容/.test(text) ? 8 : 4, reason: '会社概要・事業内容のリンク' };
}

/** 同じURLをまとめ、スコアの高い順に並べる（#以降は無視） */
export function topLinks(links: ScoredLink[], limit: number, exclude: Set<string> = new Set()): ScoredLink[] {
  const best = new Map<string, ScoredLink>();
  for (const l of links) {
    const key = l.href.split('#')[0];
    if (exclude.has(key)) continue;
    const cur = best.get(key);
    if (!cur || cur.score < l.score) best.set(key, { ...l, href: key });
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

export const COMMON_CONTACT_PATHS = ['/contact', '/contact/', '/inquiry', '/inquiry/', '/form', '/otoiawase', '/toiawase', '/company/contact', '/contact-us', '/contact/index.html'];
