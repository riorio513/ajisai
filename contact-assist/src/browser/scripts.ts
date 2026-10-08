/** 読み取り専用ページスクリプトのレジストリ。ここに登録されたものだけがブラウザ内で実行される。 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'scripts');

export const SCRIPT_NAMES = ['extract-forms', 'extract-page', 'scroll-page'] as const;
export type ScriptName = (typeof SCRIPT_NAMES)[number];

const cache = new Map<ScriptName, string>();

export function scriptSource(name: ScriptName): string {
  let s = cache.get(name);
  if (!s) {
    s = readFileSync(join(dir, `${name}.js`), 'utf8');
    cache.set(name, s);
  }
  return s;
}

export const SCRIPTS_DIR = dir;
