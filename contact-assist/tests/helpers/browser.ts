import { existsSync, readdirSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BrowserSession } from '../../src/browser/session';

function findChromium(): string | undefined {
  if (process.env.ASSIST_BROWSER_PATH) return process.env.ASSIST_BROWSER_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root).filter((x) => x.startsWith('chromium-'))) {
    for (const rel of ['chrome-linux/chrome', 'chrome-win/chrome.exe', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      const p = join(root, d, rel);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

export async function launchTestBrowser() {
  const dir = mkdtempSync(join(tmpdir(), 'ca-profile-'));
  return BrowserSession.launch({ userDataDir: dir, headless: true, executablePath: findChromium() });
}
