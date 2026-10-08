import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** ローカル保存先（アプリフォルダ内の data/）。環境変数 ASSIST_DATA_DIR で変更できる。元のExcelには一切書かない */
export function dataDir(): string {
  const d = resolve(process.env.ASSIST_DATA_DIR ?? join(process.cwd(), 'data'));
  mkdirSync(d, { recursive: true });
  return d;
}

export function subDir(name: string): string {
  const d = join(dataDir(), name);
  mkdirSync(d, { recursive: true });
  return d;
}
