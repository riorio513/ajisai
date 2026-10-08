import { Controller } from './controller';
import { createApp } from './http';
import { openInDefaultBrowser } from './system';

const port = Number(process.env.ASSIST_PORT ?? 4823);
const ctrl = new Controller();
const app = createApp(ctrl, port);

const server = app.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log('────────────────────────────────────────────');
  console.log(' お問い合わせ入力支援アプリを起動しました');
  console.log(` 画面: ${url}`);
  console.log(' （この黒い画面は閉じないでください。終了するときは Ctrl+C）');
  console.log('────────────────────────────────────────────');
  if (process.env.ASSIST_NO_OPEN !== '1') openInDefaultBrowser(url);
});
server.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EADDRINUSE') console.error(`ポート${port}はすでに使われています。アプリが二重に起動していないか確認してください。`);
  else console.error(e);
  process.exit(1);
});

const shutdown = () => {
  void ctrl.shutdown().finally(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
