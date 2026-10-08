/**
 * デバッグログ。個人情報（氏名・メール・電話・住所・本文全文）を残さないよう、
 * 記録できる項目を決めておき、文字列は短く切り、メール/電話らしき文字列は伏せる。
 */
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { subDir } from './paths';

export interface LogEvent {
  company?: string;
  action: string;
  ok?: boolean;
  code?: string;
  url?: string;
  message?: string;
}

const ALLOWED: (keyof LogEvent)[] = ['company', 'action', 'ok', 'code', 'url', 'message'];

export function sanitize(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  let s = v
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/\+?\d[\d\-() ]{8,}\d/g, '[number]');
  if (s.length > 200) s = s.slice(0, 200) + '…';
  return s;
}

export function formatLog(e: LogEvent, now = new Date()): string {
  const o: Record<string, unknown> = { t: now.toISOString() };
  for (const k of ALLOWED) if (e[k] !== undefined) o[k] = sanitize(e[k]);
  return JSON.stringify(o);
}

export async function writeLog(e: LogEvent): Promise<void> {
  const now = new Date();
  const file = join(subDir('logs'), `app-${now.toISOString().slice(0, 10)}.log`);
  try {
    await appendFile(file, formatLog(e, now) + '\n', 'utf8');
  } catch {
    /* ログ失敗で処理を止めない */
  }
}
