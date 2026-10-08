import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// UI は src/ui をビルドして dist-ui に出力する。サーバー(src/server)がそれを配信する。
export default defineConfig({
  root: 'src/ui',
  plugins: [react()],
  build: { outDir: '../../dist-ui', emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:4823' } },
});
