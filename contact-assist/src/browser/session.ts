/**
 * Playwright の起動とページ読み取り。
 * 他のモジュールは Playwright を直接触らず、ここの ReadOnlyPage だけを使う。
 */
import { chromium, type BrowserContext, type Page } from 'playwright-core';
import type { CaptchaInfo, RawFormInfo, RawPageForms } from '../shared/types';
import { guardPage, guardFrame } from './safe-page';
import { scriptSource, ScriptName } from './scripts';

export interface PageLink {
  href: string;
  text: string;
  area: 'header' | 'footer' | 'nav' | 'main';
  title: string;
}

export interface PageInfo {
  url: string;
  title: string;
  lang: string;
  h1: string[];
  headings: string[];
  text: string;
  links: PageLink[];
  iframes: string[];
  hasFormTag: boolean;
  metaDescription: string;
  mailtos: string[];
}

export interface PageLoad {
  ok: boolean;
  status: number | null;
  finalUrl: string;
  error?: string;
  /** アクセス制限・bot対策ページに見える（回避はせず、アクセス不可として扱う） */
  blocked?: boolean;
}

const BLOCK_PATTERNS = [/just a moment/i, /attention required/i, /access denied/i, /verify you are human/i, /アクセスが制限/, /アクセスを制限/, /ご利用の環境からのアクセスは/, /403 forbidden/i, /request blocked/i];

export class ReadOnlyPage {
  private readonly page: Page;
  constructor(page: Page) {
    this.page = guardPage(page);
  }

  url(): string {
    return this.page.url();
  }

  async bringToFront(): Promise<void> {
    await this.page.bringToFront();
  }

  isClosed(): boolean {
    return this.page.isClosed();
  }

  async close(): Promise<void> {
    if (!this.page.isClosed()) await this.page.close();
  }

  /** ページを開く（移動のみ） */
  async open(url: string, timeoutMs = 25000): Promise<PageLoad> {
    try {
      const resp = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      await this.settle();
      const status = resp ? resp.status() : null;
      const finalUrl = this.page.url();
      let blocked = false;
      if (status !== null && [403, 429, 503].includes(status)) blocked = true;
      if (!blocked) {
        const title = await this.page.title().catch(() => '');
        if (BLOCK_PATTERNS.some((p) => p.test(title))) blocked = true;
      }
      const ok = status === null ? true : status < 400;
      return { ok: ok && !blocked, status, finalUrl, blocked, error: ok ? undefined : `HTTP ${status}` };
    } catch (e) {
      return { ok: false, status: null, finalUrl: url, error: (e as Error).message.split('\n')[0] };
    }
  }

  async settle(): Promise<void> {
    await this.page.waitForLoadState('load', { timeout: 8000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => undefined);
  }

  private async run<T>(frame: { evaluate: (s: string) => Promise<unknown> }, name: ScriptName): Promise<T> {
    return (await frame.evaluate(scriptSource(name))) as T;
  }

  /** 遅延読み込みを出すためスクロールする（スクロールのみ） */
  async scroll(): Promise<void> {
    await this.run(this.page, 'scroll-page').catch(() => undefined);
  }

  async readPage(): Promise<PageInfo> {
    return this.run<PageInfo>(this.page, 'extract-page');
  }

  /** 診断用: テスト用ダミーページが記録した操作履歴を読む（ダミーページ以外では null） */
  async readProbe(): Promise<{ events: string[]; mutations: string[]; values: string | null }[]> {
    const out: { events: string[]; mutations: string[]; values: string | null }[] = [];
    for (const frame of this.page.frames().map((f) => guardFrame(f))) {
      try {
        const r = await this.run<{ events: string[]; mutations: string[]; values: string | null } | null>(frame, 'read-probe');
        if (r) out.push(r);
      } catch {
        /* 読めないフレームは無視 */
      }
    }
    return out;
  }

  /** 全フレーム（iframe 含む）の入力フォーム構造を読み取る */
  async readForms(): Promise<RawPageForms> {
    const frames = this.page.frames().map((f) => guardFrame(f));
    const forms: RawFormInfo[] = [];
    const captchaKinds = new Set<string>();
    let title = '';
    let url = this.page.url();
    for (const [i, frame] of frames.entries()) {
      try {
        const r = await this.run<RawPageForms>(frame, 'extract-forms');
        if (i === 0) {
          title = r.title;
          url = r.url;
        }
        for (const f of r.forms) forms.push({ ...f, index: forms.length });
        r.captcha.kinds.forEach((k) => captchaKinds.add(k));
      } catch {
        // クロスオリジンで読めないフレームなどは無視
      }
    }
    const captcha: CaptchaInfo = { present: captchaKinds.size > 0, kinds: [...captchaKinds] };
    return { url, title, forms, captcha, pageText: '' };
  }
}

export interface LaunchOptions {
  userDataDir: string;
  headless?: boolean;
  executablePath?: string;
}

export class BrowserSession {
  private constructor(private readonly ctx: BrowserContext, readonly browserName: string) {}

  static async launch(opts: LaunchOptions): Promise<BrowserSession> {
    const headless = opts.headless ?? process.env.ASSIST_HEADLESS === '1';
    const exe = opts.executablePath ?? process.env.ASSIST_BROWSER_PATH;
    const attempts: { label: string; options: Parameters<typeof chromium.launchPersistentContext>[1] }[] = [];
    if (exe) attempts.push({ label: exe, options: { executablePath: exe, headless } });
    else {
      attempts.push({ label: 'Google Chrome', options: { channel: 'chrome', headless } });
      attempts.push({ label: 'Microsoft Edge', options: { channel: 'msedge', headless } });
      attempts.push({ label: 'Chromium', options: { headless } });
    }
    const errors: string[] = [];
    for (const a of attempts) {
      try {
        const ctx = await chromium.launchPersistentContext(opts.userDataDir, {
          ...a.options,
          viewport: headless ? { width: 1280, height: 900 } : null,
          locale: 'ja-JP',
          args: ['--no-first-run', '--no-default-browser-check'],
        });
        return new BrowserSession(ctx, a.label);
      } catch (e) {
        errors.push(`${a.label}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
    throw new Error(`ブラウザ(Chrome/Edge)を起動できませんでした。\n${errors.join('\n')}`);
  }

  async newPage(): Promise<ReadOnlyPage> {
    return new ReadOnlyPage(await this.ctx.newPage());
  }

  async close(): Promise<void> {
    await this.ctx.close().catch(() => undefined);
  }
}
