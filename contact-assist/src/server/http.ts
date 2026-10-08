import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Controller, UserError } from './controller';
import { readFile } from 'node:fs/promises';
import { subDir } from '../storage/paths';
import { openInDefaultBrowser } from './system';

const HEADER = 'x-contact-assist';

export function createApp(ctrl: Controller, port: number) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  // このサーバーはあなたのPC内だけで使う。他のWebページからの操作（CSRF/DNSリバインディング）を防ぐ
  app.use((req: Request, res: Response, next: NextFunction) => {
    const host = (req.headers.host ?? '').toLowerCase();
    if (!new RegExp(`^(127\\.0\\.0\\.1|localhost):${port}$`).test(host)) return void res.status(403).send('forbidden host');
    if (req.path.startsWith('/api/')) {
      if (req.method !== 'GET' && req.headers[HEADER] !== '1') return void res.status(403).json({ error: 'forbidden' });
      const origin = req.headers.origin;
      if (origin && !new RegExp(`^http://(127\\.0\\.0\\.1|localhost):(${port}|5173)$`).test(origin)) return void res.status(403).json({ error: 'forbidden origin' });
    }
    next();
  });

  const wrap = (fn: (req: Request, res: Response) => Promise<unknown> | unknown) => async (req: Request, res: Response) => {
    try {
      const r = await fn(req, res);
      if (!res.headersSent) res.json(r ?? { ok: true });
    } catch (e) {
      const user = e instanceof UserError;
      if (!user) console.error(e);
      res.status(user ? 400 : 500).json({ error: (e as Error).message });
    }
  };
  const key = (req: Request): string => String(req.query.key ?? req.body?.key ?? '');

  app.get('/api/state', wrap(() => ctrl.state()));
  app.post('/api/excel/load', wrap(async (req) => void (await ctrl.loadExcel(String(req.body.path ?? '')))));
  app.post('/api/excel/pick', wrap(async () => {
    const p = await ctrl.pick();
    if (p) await ctrl.loadExcel(p);
    return { picked: !!p };
  }));
  app.post('/api/excel/reload', wrap(() => ctrl.reload()));
  app.get('/api/structure/preview', wrap((req) =>
    ctrl.preview(String(req.query.sheet ?? ''), req.query.orientation === 'columns' ? 'columns' : 'rows', req.query.role === 'templates' ? 'templates' : 'company')));
  app.post('/api/mapping', wrap((req) => ctrl.saveMapping(req.body)));
  app.delete('/api/mapping', wrap(() => ctrl.clearMapping()));
  app.post('/api/master/resolve', wrap((req) => ctrl.resolveConflict(String(req.body.conflictId), String(req.body.candidateId))));
  app.delete('/api/master/resolve', wrap(() => ctrl.clearConflictChoices()));

  app.get('/api/company', wrap((req) => ctrl.companyView(key(req))));
  app.post('/api/company/research', wrap(async (req) => {
    const mode = req.body.mode === 'form' || req.body.mode === 'ai' ? req.body.mode : 'full';
    await ctrl.research(key(req), mode);
  }));
  app.post('/api/company/override', wrap((req) => ctrl.setOverride(key(req), req.body.patch ?? {})));
  app.post('/api/company/open-form', wrap(async (req) => ({ url: await ctrl.openForm(key(req), req.body.where === 'default' ? 'default' : 'controlled') })));
  app.post('/api/company/reanalyze-current', wrap((req) => ctrl.reanalyzeCurrent(key(req))));
  app.post('/api/open-url', wrap((req) => {
    if (!openInDefaultBrowser(String(req.body.url ?? ''))) throw new UserError('URLを開けませんでした');
  }));

  app.post('/api/queue/start', wrap((req) => ctrl.startQueue(key(req), Number(req.body?.limit) || undefined)));
  app.post('/api/queue/stop', wrap(() => ctrl.stopQueue()));
  app.post('/api/settings/ai', wrap((req) => ctrl.setAiEnabled(req.body.enabled === true)));
  app.get('/api/logs', wrap(async () => {
    const dir = subDir('logs');
    const name = `app-${new Date().toISOString().slice(0, 10)}.log`;
    try {
      const text = await readFile(join(dir, name), 'utf8');
      return { file: join(dir, name), lines: text.trim().split('\n').slice(-200) };
    } catch {
      return { file: join(dir, name), lines: [] };
    }
  }));

  // UI（ビルド済み）
  const ui = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist-ui');
  if (existsSync(ui)) {
    app.use(express.static(ui));
    app.get('*', (_req, res) => res.sendFile(join(ui, 'index.html')));
  } else {
    app.get('/', (_req, res) => res.set('content-type', 'text/plain; charset=utf-8').send('UIがまだビルドされていません。`npm run build` を実行してください。'));
  }
  return app;
}
