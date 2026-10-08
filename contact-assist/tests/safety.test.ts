/**
 * 安全性のテスト:
 *  - フォームに自動入力しない / 値を変えない / イベントを発火しない
 *  - reCAPTCHA を操作しない / 確認・送信ボタンを押さない
 *  - ブラウザ操作層に入力用コードが存在せず、呼ぼうとしても例外になる
 *  - Excel を書き換えるコードが存在しない
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { startFixtureServer } from './helpers/server';
import { launchTestBrowser } from './helpers/browser';
import { analyzeForms } from '../src/form-analyzer/analyze';
import { ForbiddenOperationError, FORBIDDEN_OPERATIONS, guardForTest } from '../src/browser/safe-page';
import { ReadOnlyPage } from '../src/browser/session';
import type { BrowserSession } from '../src/browser/session';

const SRC = join(__dirname, '..', 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk(SRC).filter((f) => /\.(ts|tsx|js)$/.test(f));
const rel = (f: string) => relative(SRC, f).replace(/\\/g, '/');
const read = (f: string) => readFileSync(f, 'utf8');
/** コメントと文字列リテラル中の説明文で誤検出しないよう、行コメントと /* *​/ を除く */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('静的検査: ブラウザ操作層に入力用コードが無い', () => {
  const INPUT_CALLS = /\.(fill|type|press|pressSequentially|check|uncheck|setChecked|selectOption|setInputFiles|dispatchEvent|dblclick|tap|hover|focus|blur|dragAndDrop|requestSubmit|submit)\s*\(/;
  const CLICK = /\.click\s*\(/;
  const DEVICES = /\b(keyboard|touchscreen)\b\s*\.|\.mouse\s*\./;
  const LOCATORS = /\.(locator|getByRole|getByText|getByLabel|getByPlaceholder|frameLocator|\$eval|\$\$eval|evaluateHandle|addInitScript|addScriptTag|setContent|route)\s*\(/;
  const DOM_WRITES = /\.(value|checked|selectedIndex|innerHTML|outerHTML|textContent|innerText)\s*=[^=]|\.setAttribute\s*\(|\.removeAttribute\s*\(|\.appendChild\s*\(|\.insertBefore\s*\(|\.remove\s*\(\s*\)|\.append\s*\(|\.prepend\s*\(/;

  it('（検査自体の確認）違反コードを実際に検出できる', () => {
    for (const bad of ['page.fill("#a","b")', 'await el.type("x")', 'p.keyboard.press("Enter")', 'x.selectOption("1")', 'frame.dispatchEvent("click")', 'form.submit()', 'a.check()']) {
      expect(INPUT_CALLS.test(bad) || DEVICES.test(bad)).toBe(true);
    }
    expect(CLICK.test('btn.click()')).toBe(true);
    expect(LOCATORS.test('page.locator("input").fill')).toBe(true);
    expect(DOM_WRITES.test('el.value = "x"')).toBe(true);
    expect(DOM_WRITES.test("el.setAttribute('a','b')")).toBe(true);
  });

  it('どのソースにも、入力・クリック・送信の呼び出しが無い', () => {
    const bad: string[] = [];
    for (const f of files) {
      const code = stripComments(read(f));
      for (const re of [INPUT_CALLS, CLICK, DEVICES]) {
        const m = re.exec(code);
        if (m) bad.push(`${rel(f)}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('Playwright を import してよいのは src/browser だけ', () => {
    const bad = files.filter((f) => /from ['"]playwright(-core)?['"]/.test(read(f)) && !rel(f).startsWith('browser/')).map(rel);
    expect(bad).toEqual([]);
  });

  it('locator など任意要素を操作できる API は safe-page 以外で使わない', () => {
    const bad: string[] = [];
    for (const f of files) {
      if (rel(f) === 'browser/safe-page.ts') continue;
      const m = LOCATORS.exec(stripComments(read(f)));
      if (m) bad.push(`${rel(f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });

  it('ブラウザ内で実行するスクリプトは DOM を書き換えない', () => {
    const scripts = files.filter((f) => rel(f).startsWith('browser/scripts/') && f.endsWith('.js'));
    expect(scripts.length).toBeGreaterThanOrEqual(3);
    const bad: string[] = [];
    for (const f of scripts) {
      const code = stripComments(read(f));
      for (const re of [DOM_WRITES, INPUT_CALLS, CLICK, /dispatchEvent|new (Mouse|Keyboard|Input|Focus)?Event\(/, /\.(scrollIntoView|play|reset)\s*\(/]) {
        const m = re.exec(code);
        if (m) bad.push(`${rel(f)}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('ReadOnlyPage に入力系のメソッドが存在しない', () => {
    const names = Object.getOwnPropertyNames(ReadOnlyPage.prototype);
    for (const n of FORBIDDEN_OPERATIONS) expect(names).not.toContain(n);
  });
});

describe('実行時ガード: 入力系を呼ぶと例外になる', () => {
  const fakePage = {
    goto: async () => 'ok',
    fill: () => 'filled',
    click: () => 'clicked',
    keyboard: { press: () => 'x' },
    locator: () => ({ fill: () => 'x' }),
    selectOption: () => 'x',
    frames: () => [],
  };
  const guarded = guardForTest(fakePage, 'page') as unknown as Record<string, (...a: unknown[]) => unknown>;
  it('許可された操作は通る', async () => {
    await expect(guarded.goto('https://example.com')).resolves.toBe('ok');
  });
  for (const op of ['fill', 'click', 'keyboard', 'locator', 'selectOption']) {
    it(`${op} は ForbiddenOperationError`, () => {
      expect(() => guarded[op]).toThrow(ForbiddenOperationError);
    });
  }
  it('プロパティの書き込みも禁止', () => {
    expect(() => {
      (guarded as Record<string, unknown>).anything = 1;
    }).toThrow(ForbiddenOperationError);
  });
});

describe('静的検査: Excel を書き換えない', () => {
  it('Excel の書き込み API を使うのは、新規サンプル生成ツールだけ', () => {
    const bad: string[] = [];
    for (const f of files) {
      if (rel(f) === 'cli/make-sample.ts') continue;
      const code = stripComments(read(f));
      const m = /\.xlsx\.(write|writeFile|writeBuffer)\b|workbook\.commit|\.xlsx\.createInputStream|\.csv\.write/.exec(code);
      if (m) bad.push(`${rel(f)}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });
  it('ファイル書き込みは data 保存層と生成ツールに限定される', () => {
    const bad: string[] = [];
    for (const f of files) {
      const r = rel(f);
      if (r.startsWith('storage/') || r === 'cli/make-sample.ts') continue;
      const m = /\b(writeFile|writeFileSync|appendFile|appendFileSync|createWriteStream|rename|unlink|rm|copyFile)\s*\(/.exec(stripComments(read(f)));
      if (m) bad.push(`${r}: ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });
  it('Excel読込モジュールは exceljs の読み取りのみ', () => {
    const code = read(join(SRC, 'excel', 'reader.ts'));
    expect(code).toContain('xlsx.load');
    expect(code).not.toMatch(/xlsx\.write/);
  });
});

describe('動作検査: 解析中にフォームへ何も起きない', () => {
  let server: Awaited<ReturnType<typeof startFixtureServer>>;
  let browser: BrowserSession;
  beforeAll(async () => {
    server = await startFixtureServer();
    browser = await launchTestBrowser();
  });
  afterAll(async () => {
    await browser?.close();
    await server?.close();
  });

  const forms = [
    'form-a', 'form-b', 'form-c', 'form-d', 'form-e', 'form-f', 'form-g-iframe', 'form-i-shadow', 'form-j-unknown', 'form-h-restricted',
  ];
  for (const name of forms) {
    it(`${name}: イベント発火・値変更・DOM変更が一切無い / 送信されない`, async () => {
      const page = await browser.newPage();
      const load = await page.open(`${server.base}/forms/${name}.html`);
      expect(load.ok).toBe(true);
      const before = await page.readProbe();
      await page.scroll();
      await page.readPage();
      const raw = await page.readForms();
      analyzeForms(raw);
      const after = await page.readProbe();
      expect(after.length).toBe(before.length);
      after.forEach((a, i) => {
        expect(a.events).toEqual([]); // input/change/click/submit/focus/key... 一つも発火していない
        expect(a.mutations.length).toBe(before[i].mutations.length); // DOMの属性・子要素・文字が変わっていない
        expect(a.values).toBe(before[i].values); // すべての入力値・選択・チェック状態が同じ
      });
      await page.close();
      expect(server.posts).toEqual([]); // どのフォームも送信されていない
    });
  }

  it('reCAPTCHA のあるフォームを読んでも、CAPTCHA には触れない', async () => {
    const page = await browser.newPage();
    await page.open(`${server.base}/forms/form-b.html`);
    const raw = await page.readForms();
    expect(raw.captcha.present).toBe(true);
    const probes = await page.readProbe();
    expect(probes.every((p) => p.events.length === 0)).toBe(true);
    await page.close();
  });
});
