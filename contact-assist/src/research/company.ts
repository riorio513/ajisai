/** 企業の公式サイト特定のためのユーティリティ */
import { registrableDomain } from './links';

const CORP_WORDS = /株式会社|有限会社|合同会社|合資会社|合名会社|一般社団法人|公益社団法人|一般財団法人|公益財団法人|社会福祉法人|医療法人社団|医療法人財団|医療法人|学校法人|特定非営利活動法人|宗教法人|協同組合|NPO法人|\(株\)|\(有\)|㈱|㈲|co\.?,?\s*ltd\.?|inc\.?|corp\.?|corporation|company|limited|llc|k\.k\./gi;

/** 法人格を除いた企業名の核（照合用） */
export function companyCore(name: string): string {
  return name.normalize('NFKC').replace(CORP_WORDS, '').replace(/[\s　・･\-ー_.,，、()（）「」『』]+/g, '').toLowerCase();
}

/** ページの文章に企業名の核が含まれるか */
export function nameAppears(name: string, haystacks: string[]): boolean {
  const core = companyCore(name);
  if (core.length < 2) return false;
  const joined = haystacks.join(' ').normalize('NFKC').replace(/[\s　・･\-ー_.,，、()（）「」『』]+/g, '').toLowerCase();
  return joined.includes(core);
}

/** 公式サイトにはなり得ないドメイン（求人・企業情報・SNS・検索・地図など） */
const NON_OFFICIAL = [
  'wantedly.com', 'indeed.com', 'rikunabi.com', 'mynavi.jp', 'en-japan.com', 'doda.jp', 'baseconnect.in', 'houjin.jp', 'corp-search.net',
  'mapion.co.jp', 'tabelog.com', 'wikipedia.org', 'facebook.com', 'x.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com',
  'prtimes.jp', 'note.com', 'ameblo.jp', 'goo.ne.jp', 'yahoo.co.jp', 'google.com', 'bing.com', 'duckduckgo.com', 'itp.ne.jp', 'navitime.co.jp',
  'jobtalk.jp', 'openwork.jp', 'vorkers.com', 'kaisha-info.com', 'nikkei.com', 'toyokeizai.net', 'indeed.jp', 'stanby.com', 'townwork.net',
  'baitoru.com', 'hellowork.mhlw.go.jp', 'jp.indeed.com', 'kyujin-box.com', 'jobcan.jp', 'catr.jp', 'ullet.com', 'biz-journal.jp', 'bizmapps.com',
  'cnet.com', 'amazon.co.jp', 'rakuten.co.jp', 'ekiten.jp', 'jmty.jp', 'kakaku.com',
];

export function isNonOfficialDomain(host: string): boolean {
  const d = registrableDomain(host);
  return NON_OFFICIAL.some((n) => d === n || d.endsWith('.' + n) || host.endsWith(n));
}

// ───────── 検索結果のURL解読（検索エンジンのリダイレクトURLから実URLを取り出す）─────────

export function decodeSearchResultUrl(href: string): string | null {
  try {
    const u = new URL(href);
    // DuckDuckGo
    const uddg = u.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);
    // Bing の ck/a リダイレクト: u=a1<base64url>
    if (/bing\.com$/.test(u.hostname) && u.pathname.startsWith('/ck/')) {
      const enc = u.searchParams.get('u');
      if (enc && enc.startsWith('a1')) {
        const b64 = enc.slice(2).replace(/-/g, '+').replace(/_/g, '/');
        const decoded = Buffer.from(b64, 'base64').toString('utf8');
        if (/^https?:\/\//.test(decoded)) return decoded;
      }
      return null;
    }
    // Google の /url?q=
    if (/google\./.test(u.hostname) && u.pathname === '/url') return u.searchParams.get('q');
    return href;
  } catch {
    return null;
  }
}

export interface SearchEngine {
  name: string;
  url: (query: string) => string;
  /** 結果ページ自身のドメイン */
  host: RegExp;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  { name: 'DuckDuckGo', url: (q) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, host: /duckduckgo\.com$/ },
  { name: 'Bing', url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=ja`, host: /bing\.com$/ },
];
