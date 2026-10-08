/**
 * ブラウザ操作の安全装置。
 *
 * このアプリは問い合わせフォームへ「入力・選択・クリック・送信」を行わない。
 * そのため Playwright の Page / Frame は、読み取りと移動に必要なメソッドだけを許可する
 * allowlist 方式の Proxy で包み、それ以外（fill, type, press, check, selectOption, click,
 * setInputFiles, dispatchEvent, keyboard, mouse, locator など）は呼んだ瞬間に例外にする。
 * 将来うっかり入力系のコードが書かれても、実行時に止まる。
 */
import type { Frame, Page } from 'playwright-core';

export class ForbiddenOperationError extends Error {
  constructor(op: string) {
    super(`安全のため禁止されている操作です: ${op}（このアプリは問い合わせフォームへ入力・クリック・送信しません）`);
    this.name = 'ForbiddenOperationError';
  }
}

/** Page で許可する操作（読み取り・移動・待機のみ） */
export const PAGE_ALLOWED = new Set<string | symbol>([
  'goto', 'url', 'title', 'frames', 'mainFrame', 'waitForLoadState', 'waitForTimeout', 'close', 'bringToFront',
  'isClosed', 'on', 'once', 'off', 'removeListener', 'setDefaultTimeout', 'setDefaultNavigationTimeout', 'evaluate',
  'then', 'toJSON', 'constructor', Symbol.toPrimitive, Symbol.toStringTag,
]);

/** Frame で許可する操作 */
export const FRAME_ALLOWED = new Set<string | symbol>([
  'evaluate', 'url', 'name', 'childFrames', 'parentFrame', 'isDetached', 'waitForLoadState', 'title',
  'then', 'toJSON', 'constructor', Symbol.toPrimitive, Symbol.toStringTag,
]);

/** 明示的に禁止する名前（テストと静的検査でも参照する） */
export const FORBIDDEN_OPERATIONS = [
  'fill', 'type', 'press', 'pressSequentially', 'check', 'uncheck', 'setChecked', 'selectOption', 'setInputFiles',
  'click', 'dblclick', 'tap', 'hover', 'focus', 'blur', 'dispatchEvent', 'dragAndDrop', 'keyboard', 'mouse', 'touchscreen',
  'locator', 'getByRole', 'getByText', 'getByLabel', 'getByPlaceholder', 'frameLocator', '$', '$$', '$eval', '$$eval',
  'evaluateHandle', 'route', 'addInitScript', 'addScriptTag', 'setContent', 'submit', 'requestSubmit',
] as const;

function guard<T extends object>(target: T, allowed: Set<string | symbol>, wrapFrames: boolean): T {
  return new Proxy(target, {
    get(t, prop, receiver) {
      if (!allowed.has(prop)) throw new ForbiddenOperationError(String(prop));
      const v = Reflect.get(t, prop, receiver);
      if (typeof v !== 'function') return v;
      return (...args: unknown[]) => {
        const r = (v as (...a: unknown[]) => unknown).apply(t, args);
        if (!wrapFrames) return r;
        if (prop === 'frames' || prop === 'childFrames') return (r as Frame[]).map((f) => guardFrame(f));
        if (prop === 'mainFrame' || prop === 'parentFrame') return r ? guardFrame(r as Frame) : r;
        return r;
      };
    },
    set(_t, prop) {
      throw new ForbiddenOperationError(`set ${String(prop)}`);
    },
  });
}

export function guardPage(page: Page): Page {
  return guard(page, PAGE_ALLOWED, true);
}

export function guardFrame(frame: Frame): Frame {
  return guard(frame, FRAME_ALLOWED, true);
}

/** テスト用: 任意のオブジェクトを同じ規則で包む */
export function guardForTest<T extends object>(obj: T, kind: 'page' | 'frame'): T {
  return guard(obj, kind === 'page' ? PAGE_ALLOWED : FRAME_ALLOWED, false);
}
