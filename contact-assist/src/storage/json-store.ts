import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

/** 壊れにくい JSON 保存（一時ファイルへ書いてから置き換える） */
export async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = join(dirname(path), `.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
  await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
  await rename(tmp, path);
}
