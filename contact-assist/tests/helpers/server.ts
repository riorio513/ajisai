import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import type { AddressInfo } from 'node:net';

const ROOT = join(__dirname, '..', '..', 'fixtures');
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

/** ダミーサイト/フォームを配信するローカルサーバー。POSTが来たら記録する（送信されていないことの確認用） */
export async function startFixtureServer() {
  const posts: string[] = [];
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'GET') {
      posts.push(`${req.method} ${req.url}`);
      res.writeHead(200).end('ok');
      return;
    }
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'text/plain' }).end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as AddressInfo).port;
  return {
    base: `http://127.0.0.1:${port}`,
    posts,
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}
