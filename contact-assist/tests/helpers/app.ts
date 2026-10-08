import { createServer } from 'node:net';
import type { Server } from 'node:http';
import { existsSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../../src/server/http';
import { Controller } from '../../src/server/controller';

export function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const s = createServer().listen(0, '127.0.0.1', () => {
      const p = (s.address() as { port: number }).port;
      s.close(() => resolve(p));
    });
  });
}

export function findChrome(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (!existsSync(root)) return undefined;
  const d = readdirSync(root).find((x) => x.startsWith('chromium-') && !x.includes('headless'));
  const p = d && join(root, d, 'chrome-linux/chrome');
  return p && existsSync(p) ? p : undefined;
}

export interface TestApp {
  base: string;
  dataDir: string;
  ctrl: Controller;
  stop: () => Promise<void>;
  get: <T>(path: string) => Promise<T>;
  post: (path: string, body?: unknown) => Promise<{ status: number; json: Record<string, unknown> }>;
}

export async function startTestApp(dataDir = mkdtempSync(join(tmpdir(), 'ca-data-'))): Promise<TestApp> {
  process.env.ASSIST_DATA_DIR = dataDir;
  process.env.ASSIST_AI = 'off';
  process.env.ASSIST_HEADLESS = '1';
  const chrome = findChrome();
  if (chrome) process.env.ASSIST_BROWSER_PATH = chrome;
  const ctrl = new Controller({ headless: true });
  const port = await freePort();
  const app = createApp(ctrl, port);
  const server = await new Promise<Server>((r) => {
    const s = app.listen(port, '127.0.0.1', () => r(s));
  });
  const base = `http://127.0.0.1:${port}`;
  return {
    base,
    dataDir,
    ctrl,
    stop: async () => {
      await ctrl.shutdown();
      await new Promise((r) => server.close(r));
    },
    get: async <T,>(path: string) => (await fetch(base + path)).json() as Promise<T>,
    post: async (path: string, body: unknown = {}) => {
      const r = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-contact-assist': '1' }, body: JSON.stringify(body) });
      return { status: r.status, json: (await r.json()) as Record<string, unknown> };
    },
  };
}
