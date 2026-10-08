/** OS依存の小さな操作（ファイル選択ダイアログ・既定ブラウザで開く） */
import { spawn } from 'node:child_process';

export function cleanPath(input: string): string {
  let p = input.trim();
  p = p.replace(/^["'“”]+|["'“”]+$/g, '').trim(); // エクスプローラーの「パスのコピー」は引用符つき
  if (/^file:\/\//i.test(p)) {
    p = decodeURIComponent(p.replace(/^file:\/\/\/?/i, ''));
    if (process.platform !== 'win32') p = '/' + p;
  }
  return p;
}

/** Windows のファイル選択ダイアログを出し、選ばれたパスを返す（それ以外のOSでは null） */
export function pickExcelFile(): Promise<string | null> {
  if (process.platform !== 'win32') return Promise.resolve(null);
  const script = [
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;',
    'Add-Type -AssemblyName System.Windows.Forms;',
    '$f = New-Object System.Windows.Forms.OpenFileDialog;',
    "$f.Filter = 'Excel ファイル (*.xlsx;*.xlsm)|*.xlsx;*.xlsm';",
    "$f.Title = 'Excelファイルを選択';",
    "if ($f.ShowDialog() -eq 'OK') { Write-Output $f.FileName }",
  ].join(' ');
  return new Promise((resolve) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-STA', '-Command', script], { windowsHide: false });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('error', () => resolve(null));
    child.on('close', () => resolve(out.trim() || null));
  });
}

/** 既定のブラウザでURLを開く（http/httpsのみ） */
export function openInDefaultBrowser(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    if (process.platform === 'win32') spawn('rundll32', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' }).unref();
    else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    return true;
  } catch {
    return false;
  }
}
