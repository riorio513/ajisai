/** 利用者の設定（マッピング確認結果・矛盾の選択・AI利用など）。Excel自体は変更しない。 */
import { join } from 'node:path';
import type { UserMapping } from '../shared/types';
import { hashString } from '../schema/normalize';
import { readJson, writeJson } from './json-store';
import { dataDir } from './paths';

export interface Settings {
  version: 1;
  lastExcelPath?: string;
  aiEnabled: boolean;
  /** 「この項目は無視する」で追加した項目名キーワード（フォームの項目名にこの文字が含まれていれば無視） */
  ignoreKeywords: string[];
  /** Excelごとの保存済みマッピング（見出し文字列で保持。読込のたびに再検証する） */
  mappings: Record<string, UserMapping>;
  /** Excelごとの「矛盾の解決」選択 conflictId -> candidateId */
  masterOverrides: Record<string, Record<string, string>>;
}

const DEFAULTS: Settings = { version: 1, aiEnabled: true, ignoreKeywords: [], mappings: {}, masterOverrides: {} };

export function workbookKey(path: string): string {
  return hashString(path.replace(/\\/g, '/').toLowerCase());
}

export class SettingsStore {
  private readonly file = join(dataDir(), 'settings.json');
  private cache: Settings | null = null;

  async get(): Promise<Settings> {
    if (!this.cache) this.cache = { ...DEFAULTS, ...(await readJson<Partial<Settings>>(this.file, {})) } as Settings;
    return this.cache;
  }

  async update(fn: (s: Settings) => void): Promise<Settings> {
    const s = await this.get();
    fn(s);
    await writeJson(this.file, s);
    return s;
  }
}
