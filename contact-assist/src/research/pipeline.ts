/**
 * 1社分の調査パイプライン。
 *   公式サイト特定 → 問い合わせフォーム探索 → 営業禁止確認 → 職種調査 → フォーム解析
 *
 * ブラウザは「ページを開く・スクロール・読み取り」しかしない（ReadOnlyPage）。
 * 迷う判断は ai に渡し、AIも使えなければ「要確認」にする。
 */
import type { PageInfo, ReadOnlyPage } from '../browser/session';
import type { AIProvider } from '../ai';
import type {
  Company, ContactPageCandidate, Evidence, FormAnalysis, RawPageForms, ResearchResult, SiteInfo, StatusCode,
} from '../shared/types';
import { STATUS } from '../shared/types';
import type { JobOption } from '../templates/extract';
import { toNavigableUrl } from '../excel/url';
import { analyzeForms, looksLikeContactForm } from '../form-analyzer/analyze';
import { classifyEligibility } from './restricted';
import { detectSolicitation, evidenceFrom, Passage } from './solicitation';
import {
  COMMON_CONTACT_PATHS, ScoredLink, sameSite, scoreAboutLink, scoreCareerLink, scoreContactLink, scoreNoticeLink, topLinks,
} from './links';
import { companyCore, decodeSearchResultUrl, isNonOfficialDomain, nameAppears, SEARCH_ENGINES, SearchEngine } from './company';
import { EvidenceDoc, isExactInRecruitment, pickByRule, scoreJobs, snippetFor } from './jobs';

export interface ResearchDeps {
  page: ReadOnlyPage;
  ai: AIProvider;
  searchEngines?: SearchEngine[];
  log?: (msg: string) => void;
  now?: () => Date;
  maxPages?: number;
  delayMs?: number;
  /** 検索で公式サイトを探すとき、結果の絞り込みに使う追加情報 */
  signal?: { cancelled: boolean };
}

interface Visited {
  url: string;
  info: PageInfo;
  raw: RawPageForms;
  depth: number;
  via: string;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);
const normUrl = (u: string) => u.split('#')[0].replace(/\/+$/, '');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function excerptAround(text: string, re: RegExp, len: number): string {
  const m = re.exec(text);
  if (!m) return clip(text, len);
  return text.slice(Math.max(0, m.index - 200), m.index - 200 + len);
}

/** 「AI判定だけ再実行」用に、直近の調査で読んだ文章をメモリ上だけに保持する（ディスクには保存しない） */
export interface ResearchMemory {
  passages: Passage[];
  jobDocs: EvidenceDoc[];
}

class Researcher {
  memory: ResearchMemory = { passages: [], jobDocs: [] };
  private readonly steps: string[] = [];
  private readonly evidence: Evidence[] = [];
  private readonly visited = new Map<string, Visited>();
  private readonly seen = new Set<string>();
  private readonly now: () => Date;

  constructor(private readonly d: ResearchDeps, private readonly company: Company, private readonly jobs: JobOption[]) {
    this.now = d.now ?? (() => new Date());
  }

  private step(msg: string) {
    this.steps.push(msg);
    this.d.log?.(msg);
  }
  private ev(e: Omit<Evidence, 'at'>) {
    this.evidence.push({ ...e, at: this.now().toISOString() });
  }
  private cancelled() {
    return this.d.signal?.cancelled === true;
  }

  // ───────── ページ訪問 ─────────

  private async visit(url: string, depth: number, via: string): Promise<Visited | null> {
    const key = normUrl(url);
    const existing = this.visited.get(key);
    if (existing) return existing;
    this.seen.add(key);
    await sleep(this.d.delayMs ?? 400);
    const load = await this.d.page.open(url);
    if (!load.ok) {
      this.step(`開けませんでした: ${url}（${load.blocked ? 'アクセス制限の可能性' : load.error ?? '不明'}）`);
      if (depth === 0) throw new AccessError(load.blocked ? 'アクセスが制限されているページです（制限を回避する操作は行いません）' : `ページを開けませんでした（${load.error ?? '不明'}）`);
      return null;
    }
    await this.d.page.scroll();
    const info = await this.d.page.readPage();
    const raw = await this.d.page.readForms();
    const v: Visited = { url: load.finalUrl, info, raw, depth, via };
    this.visited.set(key, v);
    this.visited.set(normUrl(load.finalUrl), v);
    this.seen.add(normUrl(load.finalUrl));
    this.step(`確認: ${info.title || load.finalUrl}（${load.finalUrl}）`);
    return v;
  }

  // ───────── 公式サイトの特定 ─────────

  private async resolveSite(): Promise<{ site: SiteInfo; top: Visited }> {
    const name = this.company.name;
    const excelUrl = toNavigableUrl(this.company.url);
    let accessError: string | undefined;
    if (excelUrl) {
      try {
        const top = await this.visit(excelUrl, 0, 'Excelの企業URL');
        if (top) {
          const verified = nameAppears(name, [top.info.title, ...top.info.h1, top.info.metaDescription, top.info.text.slice(0, 6000)]);
          const site: SiteInfo = {
            url: top.url, source: 'excel', verified,
            note: verified ? 'ExcelのURLを開き、ページ内に企業名を確認しました' : 'ExcelのURLを開きましたが、トップページ内に企業名を確認できませんでした（URLはExcelの値を採用）',
          };
          this.ev({ url: top.url, kind: '企業特定', snippet: site.note });
          return { site, top };
        }
      } catch (e) {
        if (!(e instanceof AccessError)) throw e;
        accessError = e.message;
        this.step(`ExcelのURLにアクセスできないため、企業名から探します（${e.message}）`);
      }
    }
    // 検索で探す
    const found = await this.searchOfficial();
    if (found) return found;
    if (accessError && excelUrl) throw new AccessError(accessError);
    throw new UnclearCompanyError(excelUrl ? 'ExcelのURLを開けず、検索でも公式サイトを特定できませんでした' : 'Excelに企業URLがなく、検索でも公式サイトを一意に特定できませんでした');
  }

  private async searchOfficial(): Promise<{ site: SiteInfo; top: Visited } | null> {
    const name = this.company.name;
    const engines = this.d.searchEngines ?? SEARCH_ENGINES;
    const query = `${name} 公式サイト${this.company.industry ? ' ' + this.company.industry : ''}`;
    for (const eng of engines) {
      this.step(`検索: ${eng.name}「${query}」`);
      await sleep(this.d.delayMs ?? 400);
      const load = await this.d.page.open(eng.url(query));
      if (!load.ok) continue;
      const info = await this.d.page.readPage();
      if (/captcha|are you a human|unusual traffic|ロボットではありません/i.test(info.text.slice(0, 2000) + info.title)) {
        this.step(`${eng.name} が確認画面を表示したため、検索を中止します（回避操作は行いません）`);
        continue;
      }
      const urls: string[] = [];
      for (const l of info.links) {
        const real = decodeSearchResultUrl(l.href);
        if (!real) continue;
        let u: URL;
        try {
          u = new URL(real);
        } catch {
          continue;
        }
        if (!/^https?:$/.test(u.protocol) || eng.host.test(u.hostname) || isNonOfficialDomain(u.hostname)) continue;
        const root = `${u.origin}/`;
        if (!urls.some((x) => sameSite(x, root))) urls.push(root);
        if (urls.length >= 5) break;
      }
      if (urls.length === 0) continue;
      const verified: { site: SiteInfo; top: Visited }[] = [];
      for (const u of urls.slice(0, 4)) {
        try {
          const top = await this.visit(u, 1, '検索結果');
          if (!top) continue;
          if (nameAppears(name, [top.info.title, ...top.info.h1, top.info.metaDescription, top.info.text.slice(0, 6000)])) {
            verified.push({ site: { url: top.url, source: 'search', verified: true, note: `${eng.name}の検索結果から、ページ内に企業名（${companyCore(name)}）を確認しました` }, top });
          }
        } catch {
          /* 次の候補へ */
        }
      }
      if (verified.length === 1) {
        this.ev({ url: verified[0].site.url, kind: '企業特定', snippet: verified[0].site.note });
        return verified[0];
      }
      if (verified.length > 1) {
        if (await this.d.ai.isAvailable()) {
          const r = await this.d.ai.identifyCompany({
            company: name,
            hint: this.company.industry || undefined,
            candidates: verified.map((v, i) => ({ index: i, url: v.site.url, title: v.top.info.title, excerpt: clip(v.top.info.text, 600) })),
          });
          if (r.index !== null && verified[r.index]) {
            const v = verified[r.index];
            v.site.note = `同名候補が複数あり、AIが内容から選択しました（${r.reason}）`;
            this.ev({ url: v.site.url, kind: '企業特定', snippet: v.site.note });
            return v;
          }
        }
        throw new UnclearCompanyError(`同じ企業名らしいサイトが複数見つかり、一意に特定できません（${verified.map((v) => v.site.url).join(' , ')}）`);
      }
    }
    return null;
  }

  // ───────── 問い合わせフォームの探索 ─────────

  private async crawlForContact(site: SiteInfo, top: Visited): Promise<ContactCandidate[]> {
    const maxPages = this.d.maxPages ?? 14;
    const candidates: ContactCandidate[] = [];
    const queue: { url: string; score: number; depth: number; via: string }[] = [];
    const considered = new Set<string>();

    const consider = async (v: Visited) => {
      if (considered.has(normUrl(v.url))) return;
      considered.add(normUrl(v.url));
      if (looksLikeContactForm(v.raw)) {
        const analysis = analyzeForms(v.raw);
        if (analysis) {
          let elig = classifyEligibility(analysis);
          if (elig.kind === 'unclear' && (await this.d.ai.isAvailable())) {
            const r = await this.d.ai.judgeFormEligibility({ title: analysis.title, headings: analysis.headings, excerpt: analysis.noticeText.slice(0, 1200) });
            if (r.kind !== 'unclear') elig = { kind: r.kind, reason: `AI判定: ${r.reason}` };
          }
          candidates.push({ visited: v, analysis, eligibility: elig });
          this.step(`問い合わせフォームを発見: ${v.url}（入力欄${analysis.fields.length}件 / ${elig.kind === 'restricted' ? '対象外の可能性: ' + elig.reason : '一般向け'}）`);
        }
      }
      const links = v.info.links.map((l) => scoreContactLink(l, site.url)).filter((x): x is ScoredLink => !!x);
      for (const l of topLinks(links, 6, this.seen)) {
        if (!queue.some((q) => normUrl(q.url) === normUrl(l.href))) queue.push({ url: l.href, score: l.score, depth: v.depth + 1, via: `${l.text || l.href}（${l.reason}）` });
      }
      // ページ内に埋め込まれたiframeが外部フォームサービスの場合
      for (const f of v.info.iframes) {
        if (/(form|contact|inquiry)/i.test(f) && !this.seen.has(normUrl(f)) && !queue.some((q) => q.url === f)) queue.push({ url: f, score: 6, depth: v.depth + 1, via: '埋め込みフォーム(iframe)' });
      }
    };

    await consider(top);
    let visits = 1;
    const enough = () => candidates.some((c) => c.eligibility.kind === 'general') && visits >= 2 && queue.every((q) => q.score < 10);

    const drain = async (limit: number) => {
      while (queue.length > 0 && visits < limit && !enough() && !this.cancelled()) {
        queue.sort((a, b) => b.score - a.score);
        const next = queue.shift()!;
        if (this.seen.has(normUrl(next.url)) || next.depth > 3) continue;
        const v = await this.visit(next.url, next.depth, next.via).catch(() => null);
        if (!v) continue;
        visits++;
        await consider(v);
      }
    };
    await drain(maxPages);

    // リンクから見つからなかったときの代表的なパス
    if (candidates.length === 0 && !this.cancelled()) {
      this.step('リンクから問い合わせフォームを見つけられなかったため、一般的なURLも確認します');
      const origin = new URL(site.url).origin;
      for (const p of COMMON_CONTACT_PATHS) {
        if (visits >= maxPages + 4 || this.cancelled()) break;
        const url = origin + p;
        if (this.seen.has(normUrl(url))) continue;
        const v = await this.visit(url, 2, `一般的なURL ${p}`).catch(() => null);
        if (!v) continue;
        visits++;
        await consider(v);
        if (candidates.length > 0) break;
      }
    }
    // それでも無ければサイトマップ・ページ内のリンクをたどる
    if (candidates.length === 0 && !this.cancelled()) {
      const maps = [...new Set(this.visited.values())]
        .flatMap((v) => v.info.links)
        .filter((l) => /サイトマップ|sitemap|site map/i.test(`${l.text} ${l.href}`) && sameSite(site.url, l.href) && !/\.xml($|\?)/i.test(l.href));
      for (const m of maps.slice(0, 2)) {
        const v = await this.visit(m.href, 2, 'サイトマップ').catch(() => null);
        if (!v) continue;
        visits++;
        // サイトマップ上の全リンクからお問い合わせ系を拾う
        for (const l of topLinks(v.info.links.map((x) => scoreContactLink(x, site.url)).filter((x): x is ScoredLink => !!x), 6, this.seen)) {
          queue.push({ url: l.href, score: l.score, depth: 3, via: `サイトマップ: ${l.text}` });
        }
        await drain(maxPages + 8);
        if (candidates.length > 0) break;
      }
    }
    return candidates;
  }

  // ───────── 営業禁止 ─────────

  private async checkSolicitation(chosen: ContactCandidate | undefined, site: SiteInfo): Promise<ResearchResult['solicitation']> {
    const passages: Passage[] = [];
    const add = (url: string, kind: string, text: string) => {
      if (text.trim() && !passages.some((p) => p.url === url && p.kind === kind)) passages.push({ url, kind, text: clip(text, 20000) });
    };
    for (const v of new Set(this.visited.values())) {
      const contactish = /問い?合わ?せ|contact|inquiry|相談/i.test(v.info.title + v.info.h1.join(' ') + v.url);
      add(v.url, v === chosen?.visited ? 'フォーム' : contactish ? '問い合わせ案内' : '公式サイト', v.info.text);
    }
    if (chosen) {
      add(chosen.visited.url, 'フォーム', chosen.analysis.noticeText);
      for (const f of chosen.visited.raw.forms) add(f.frameUrl, 'フォーム', f.text);
      if (chosen.visited.raw.pageText) add(chosen.visited.url + '#iframe', 'フォーム', chosen.visited.raw.pageText);
    }
    // 規約・注意事項ページ
    const noticeLinks: ScoredLink[] = [];
    const sources = chosen ? [chosen.visited, ...[...new Set(this.visited.values())].filter((v) => v !== chosen.visited && /問い?合わ?せ|contact/i.test(v.info.title + v.url))] : [];
    for (const v of sources) for (const l of v.info.links) {
      const s = scoreNoticeLink(l, site.url);
      if (s) noticeLinks.push(s);
    }
    for (const l of topLinks(noticeLinks, 3, this.seen)) {
      const v = await this.visit(l.href, 3, `注意書き: ${l.text}`).catch(() => null);
      if (v) add(v.url, '利用規約・注意事項', v.info.text);
    }

    this.memory.passages = passages;
    const checkedUrls = [...new Set(passages.map((p) => p.url))];
    this.step(`営業禁止の確認: ${checkedUrls.length}ページの文章を確認`);
    const rule = detectSolicitation(passages);
    const at = this.now().toISOString();
    if (rule.verdict === 'banned') {
      this.evidence.push(...evidenceFrom(rule.findings.filter((f) => f.level === 'banned'), at));
      return { verdict: 'banned', checkedUrls, by: 'rule' };
    }
    if (rule.verdict === 'unclear') {
      if (await this.d.ai.isAvailable()) {
        const related = rule.findings.map((f) => ({ url: f.url, text: f.sentence }));
        const r = await this.d.ai.judgeSolicitation({ company: this.company.name, passages: related.length ? related : passages.slice(0, 4) });
        if (r.verdict === 'banned' && r.quote) {
          this.ev({ url: r.url ?? checkedUrls[0], kind: '営業禁止', snippet: r.quote });
          return { verdict: 'banned', checkedUrls, by: 'ai' };
        }
        if (r.verdict === 'allowed') {
          this.ev({ url: r.url ?? checkedUrls[0], kind: '営業禁止確認', snippet: `AI判定: 営業禁止の記載ではありません（${r.reason}）` });
          return { verdict: 'none', checkedUrls, by: 'ai' };
        }
      }
      this.evidence.push(...evidenceFrom(rule.findings, at, '営業禁止確認'));
      return { verdict: 'unclear', checkedUrls, by: 'rule' };
    }
    this.ev({ url: chosen?.visited.url ?? site.url, kind: '営業禁止確認', snippet: `営業・勧誘を禁止する記載は確認されませんでした（${checkedUrls.length}ページを確認）` });
    return { verdict: 'none', checkedUrls, by: 'rule' };
  }

  // ───────── 職種 ─────────

  private async researchJob(site: SiteInfo, top: Visited): Promise<ResearchResult['job']> {
    if (this.jobs.length === 0) return { by: 'none', reason: 'Excelの文面に職種がありません' };
    const docs: EvidenceDoc[] = [];
    const all = [...new Set(this.visited.values())];
    const careerLinks: ScoredLink[] = [];
    const aboutLinks: ScoredLink[] = [];
    for (const v of all) for (const l of v.info.links) {
      const c = scoreCareerLink(l, site.url);
      if (c) careerLinks.push(c);
      const a = scoreAboutLink(l, site.url);
      if (a) aboutLinks.push(a);
    }
    let career = topLinks(careerLinks, 3, new Set());
    for (const l of career) {
      const v = await this.visit(l.href, 2, `採用情報: ${l.text}`).catch(() => null);
      if (v) {
        docs.push({ kind: '採用ページ', url: v.url, text: v.info.text });
        // 募集要項など1段下のページ
        const sub = topLinks(v.info.links.map((x) => scoreCareerLink(x, site.url)).filter((x): x is ScoredLink => !!x && /募集|職種|要項|求人/.test(x.text)), 2, this.seen);
        for (const s of sub) {
          const sv = await this.visit(s.href, 3, `募集要項: ${s.text}`).catch(() => null);
          if (sv) docs.push({ kind: '採用ページ', url: sv.url, text: sv.info.text });
        }
      }
    }
    for (const l of topLinks(aboutLinks, 2, new Set())) {
      const v = await this.visit(l.href, 2, `事業内容: ${l.text}`).catch(() => null);
      if (v) docs.push({ kind: '事業内容', url: v.url, text: v.info.text });
    }
    docs.push({ kind: '事業内容', url: top.url, text: top.info.text });
    this.memory.jobDocs = docs;
    this.step(`職種調査: 採用ページ${docs.filter((d) => d.kind === '採用ページ').length}件・事業内容${docs.filter((d) => d.kind === '事業内容').length}件を確認`);

    const cands = this.jobs.map((j, i) => ({ id: `j${i}`, label: j.label }));
    const scores = scoreJobs(docs, cands);
    const rule = pickByRule(scores);
    const labelOf = (id: string) => this.jobs[Number(id.slice(1))];
    const decide = (id: string, by: 'rule' | 'ai', exact: boolean, reason: string, hits: string[]) => {
      const j = labelOf(id);
      const sn = snippetFor(docs, hits.length ? hits : [j.label]);
      this.ev({ url: sn?.url ?? top.url, kind: exact ? '職種' : '近似職種', snippet: sn ? `${sn.kind}: …${sn.snippet}…` : reason });
      return { label: j.label, templateIds: j.templateIds, exact, by, reason } as ResearchResult['job'];
    };

    if (rule.pick && rule.confident) {
      const exact = isExactInRecruitment(cands.find((c) => c.id === rule.pick!.id)!, docs);
      const reason = exact
        ? `公式採用ページに「${rule.pick.hits[0] ?? rule.pick.label}」の記載があります`
        : `採用ページ・事業内容の記載（${rule.pick.hits.slice(0, 4).join('、')}）から、Excelの職種の中で最も近いものを選びました（近似職種）`;
      return decide(rule.pick.id, 'rule', exact, reason, rule.pick.hits);
    }
    if (await this.d.ai.isAvailable()) {
      const evidence = docs
        .map((d) => ({ url: d.url, kind: d.kind, text: d.kind === '採用ページ' ? excerptAround(d.text, /募集職種|募集要項|職種|求人/, 1500) : clip(d.text, 1200) }))
        .slice(0, 6);
      const r = await this.d.ai.pickJob({ company: this.company.name, industryHint: this.company.industry || undefined, evidence, jobs: cands });
      if (r.jobId && labelOf(r.jobId)) {
        const hits = scores.find((s) => s.id === r.jobId)?.hits ?? [];
        return decide(r.jobId, 'ai', r.exact, `AIが採用情報から選択: ${r.reason}${r.exact ? '' : '（近似職種）'}`, hits);
      }
    }
    if (rule.pick && rule.pick.score > 0) {
      return decide(rule.pick.id, 'rule', false, `根拠が弱いため近似として選択しました（記載された語: ${rule.pick.hits.slice(0, 4).join('、') || 'なし'}）。必要なら職種を選び直してください`, rule.pick.hits);
    }
    return { by: 'none', reason: '採用ページ・事業内容から職種を特定できませんでした。職種を選択してください' };
  }

  // ───────── 全体 ─────────

  async run(): Promise<ResearchResult> {
    const base = (code: StatusCode, message: string, extra: Partial<ResearchResult> = {}): ResearchResult => ({
      code,
      message,
      contactCandidates: [],
      solicitation: { verdict: 'none', checkedUrls: [], by: 'none' },
      job: { by: 'none', reason: '未調査' },
      evidence: this.evidence,
      steps: this.steps,
      researchedAt: this.now().toISOString(),
      ...extra,
    });
    let site: SiteInfo;
    let top: Visited;
    try {
      ({ site, top } = await this.resolveSite());
    } catch (e) {
      if (e instanceof AccessError) return base(STATUS.ACCESS, e.message);
      if (e instanceof UnclearCompanyError) return base(STATUS.COMPANY_UNCLEAR, e.message);
      throw e;
    }
    this.step(`公式サイト: ${site.url}`);

    const candidates = await this.crawlForContact(site, top);
    const general = candidates.filter((c) => c.eligibility.kind === 'general');
    const unclear = candidates.filter((c) => c.eligibility.kind === 'unclear');
    const chosen = general[0] ?? unclear[0];
    const candInfo: ContactPageCandidate[] = candidates.map((c) => ({
      url: c.visited.url, title: c.visited.info.title, eligibility: c.eligibility.kind, reason: c.eligibility.reason, fieldCount: c.analysis.fields.length,
    }));

    const solicitation = await this.checkSolicitation(chosen ?? candidates[0], site);
    if (solicitation.verdict === 'banned') {
      return base(STATUS.NO_SALES, '営業目的の問い合わせが禁止されているため、この企業では問い合わせ作業を行わないでください', { site, solicitation, contactUrl: (chosen ?? candidates[0])?.visited.url, contactCandidates: candInfo });
    }

    if (!chosen) {
      if (candidates.length > 0) {
        const r = candidates[0];
        this.ev({ url: r.visited.url, kind: '対象外判定', snippet: r.eligibility.reason });
        return base(STATUS.NOT_TARGET_FORM, `見つかった問い合わせフォームは特定の人向けでした（${r.eligibility.reason}）`, { site, solicitation, contactUrl: r.visited.url, contactCandidates: candInfo });
      }
      const mails = [...new Set([...this.visited.values()].flatMap((v) => v.info.mailtos))];
      return base(STATUS.NO_FORM, `公式サイトを探索しましたが、問い合わせフォームは見つかりませんでした${mails.length ? `（メールアドレスの記載のみ: ${mails.join(', ')}）` : ''}`, { site, solicitation, contactCandidates: candInfo });
    }

    const job = await this.researchJob(site, top);
    // フォームをもう一度開き直して最新の構造を取得し、AIで不明項目を補助分類
    let form: FormAnalysis = chosen.analysis;
    form = await this.refineUnknownFields(form);
    this.ev({ url: chosen.visited.url, kind: 'フォーム', snippet: `入力欄${form.fields.length}件を解析（${chosen.eligibility.reason}）` });

    let code: StatusCode = STATUS.OK;
    let message = '調査完了';
    if (chosen.eligibility.kind === 'unclear') {
      code = STATUS.FORM_UNCLEAR;
      message = `フォームが特定の人向けかどうか判断できません（${chosen.eligibility.reason}）`;
    } else if (solicitation.verdict === 'unclear') {
      code = STATUS.SALES_UNCLEAR;
      message = '営業可否に関わりそうな記載があり、判断できません。根拠を確認してください';
    } else if (job.by === 'none') {
      code = STATUS.JOB_UNCLEAR;
      message = job.reason;
    }
    return base(code, message, { site, contactUrl: chosen.visited.url, contactCandidates: candInfo, solicitation, job, form });
  }

  private async refineUnknownFields(form: FormAnalysis): Promise<FormAnalysis> {
    return refineFormWithAI(form, this.d.ai);
  }
}

interface ContactCandidate {
  visited: Visited;
  analysis: FormAnalysis;
  eligibility: { kind: 'general' | 'restricted' | 'unclear'; reason: string };
}

class AccessError extends Error {}
class UnclearCompanyError extends Error {}

/** 不明な入力項目だけをAIに分類させる（値は渡さない）。ルールで決まった項目はAIを使わない */
export async function refineFormWithAI(form: FormAnalysis, ai: AIProvider): Promise<FormAnalysis> {
  if (!(await ai.isAvailable())) return form;
  let budget = 8;
  for (const f of form.fields) {
    if (budget <= 0) break;
    if (f.std !== 'unknown' || !['text', 'textarea', 'select', 'radio'].includes(f.control)) continue;
    budget--;
    const r = await ai.classifyField({
      control: f.control, label: f.raw.label || f.raw.groupLabel, name: f.raw.name, id: f.raw.id, placeholder: f.raw.placeholder,
      type: f.raw.type, hint: f.raw.hint, options: f.raw.options.map((o) => o.label),
    });
    if (r.std) {
      f.std = r.std;
      f.stdBy = 'ai';
      f.stdConfidence = 'low';
      f.stdReason = `AI分類: ${r.reason}`;
    }
  }
  return form;
}

export async function researchCompanyWithMemory(deps: ResearchDeps, company: Company, jobs: JobOption[]): Promise<{ result: ResearchResult; memory: ResearchMemory }> {
  const r = new Researcher(deps, company, jobs);
  const result = await runSafely(r, deps);
  return { result, memory: r.memory };
}

export async function researchCompany(deps: ResearchDeps, company: Company, jobs: JobOption[]): Promise<ResearchResult> {
  return (await researchCompanyWithMemory(deps, company, jobs)).result;
}

async function runSafely(r: Researcher, deps: ResearchDeps): Promise<ResearchResult> {
  try {
    return await r.run();
  } catch (e) {
    const now = (deps.now ?? (() => new Date()))().toISOString();
    return {
      code: STATUS.OTHER,
      message: `調査中にエラーが発生しました: ${(e as Error).message}`,
      contactCandidates: [],
      solicitation: { verdict: 'none', checkedUrls: [], by: 'none' },
      job: { by: 'none', reason: '未調査' },
      evidence: [],
      steps: [],
      researchedAt: now,
    };
  }
}

/** フォームだけを再解析する（現在開いているページ、または指定URL） */
export async function reanalyzeForm(page: ReadOnlyPage, ai: AIProvider, opts: { url?: string; formIndex?: number } = {}): Promise<FormAnalysis | null> {
  if (opts.url) {
    const load = await page.open(opts.url);
    if (!load.ok) return null;
    await page.scroll();
  }
  const raw = await page.readForms();
  const a = analyzeForms(raw, { formIndex: opts.formIndex });
  return a ? refineFormWithAI(a, ai) : null;
}

/**
 * AI判定だけをやり直す（ページの再取得はしない）。メモリ上の直近の調査内容を使う。
 * 営業禁止が「要確認」だった場合の再判定、職種の再選択、不明な入力項目の再分類を行う。
 */
export async function rerunAiJudgments(
  ai: AIProvider,
  company: Company,
  jobs: JobOption[],
  prev: ResearchResult,
  memory: ResearchMemory,
  now: () => Date = () => new Date(),
): Promise<ResearchResult> {
  const result: ResearchResult = { ...prev, evidence: [...prev.evidence], steps: [...prev.steps, 'AI判定を再実行'] };
  if (!(await ai.isAvailable())) {
    result.steps.push('AIが利用できないため、再判定できません');
    return result;
  }
  const at = now().toISOString();
  if (prev.solicitation.verdict === 'unclear') {
    const rule = detectSolicitation(memory.passages);
    const related = rule.findings.map((f) => ({ url: f.url, text: f.sentence }));
    const r = await ai.judgeSolicitation({ company: company.name, passages: related.length ? related : memory.passages.slice(0, 4) });
    if (r.verdict === 'banned' && r.quote) {
      result.solicitation = { ...prev.solicitation, verdict: 'banned', by: 'ai' };
      result.evidence.push({ url: r.url ?? prev.solicitation.checkedUrls[0] ?? '', kind: '営業禁止', snippet: r.quote, at });
      result.code = STATUS.NO_SALES;
      result.message = '営業目的の問い合わせが禁止されているため、この企業では問い合わせ作業を行わないでください';
    } else if (r.verdict === 'allowed') {
      result.solicitation = { ...prev.solicitation, verdict: 'none', by: 'ai' };
      result.evidence.push({ url: r.url ?? prev.solicitation.checkedUrls[0] ?? '', kind: '営業禁止確認', snippet: `AI判定: 営業禁止の記載ではありません（${r.reason}）`, at });
      if (result.code === STATUS.SALES_UNCLEAR) {
        result.code = STATUS.OK;
        result.message = '調査完了';
      }
    }
  }
  if (memory.jobDocs.length > 0 && jobs.length > 0) {
    const cands = jobs.map((j, i) => ({ id: `j${i}`, label: j.label }));
    const evidence = memory.jobDocs
      .map((d) => ({ url: d.url, kind: d.kind, text: d.kind === '採用ページ' ? excerptAround(d.text, /募集職種|募集要項|職種|求人/, 1500) : clip(d.text, 1200) }))
      .slice(0, 6);
    const r = await ai.pickJob({ company: company.name, industryHint: company.industry || undefined, evidence, jobs: cands });
    if (r.jobId) {
      const j = jobs[Number(r.jobId.slice(1))];
      if (j) {
        result.job = { label: j.label, templateIds: j.templateIds, exact: r.exact, by: 'ai', reason: `AIが採用情報から選択: ${r.reason}${r.exact ? '' : '（近似職種）'}` };
        result.evidence.push({ url: memory.jobDocs[0].url, kind: r.exact ? '職種' : '近似職種', snippet: r.reason, at });
        if (result.code === STATUS.JOB_UNCLEAR) {
          result.code = STATUS.OK;
          result.message = '調査完了';
        }
      }
    }
  }
  if (result.form) result.form = await refineFormWithAI(result.form, ai);
  result.researchedAt = at;
  return result;
}
