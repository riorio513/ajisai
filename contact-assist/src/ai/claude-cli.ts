/**
 * ローカルの Claude Code CLI（`claude -p`）を使う AIProvider。APIキー不要（CLIのログイン状態を使う）。
 * CLI が見つからない/動かない環境では isAvailable()=false になり、アプリは「要確認」運用で動く。
 */
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { LlmProvider, LlmFn } from './llm-provider';

export interface ClaudeCliOptions {
  command?: string;
  timeoutMs?: number;
}

function run(command: string, args: string[], input: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: tmpdir(), // プロジェクト内のファイルを参照させない
      shell: process.platform === 'win32', // Windows では claude.cmd を起動するため
      windowsHide: true,
    });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('タイムアウト'));
    }, timeoutMs);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(err.trim().split('\n')[0] || `exit ${code}`));
    });
    child.stdin.end(input);
  });
}

export function createClaudeCliProvider(opts: ClaudeCliOptions = {}): LlmProvider {
  const command = opts.command ?? process.env.ASSIST_CLAUDE_COMMAND ?? 'claude';
  const timeoutMs = opts.timeoutMs ?? 120000;
  // ツールを全て無効にして、文章を読んで答えるだけにする
  // Windows では shell 経由で起動するため、空文字の引数は "" と書かないと消えてしまう
  const emptyArg = process.platform === 'win32' ? '""' : '';
  const args = ['-p', '--output-format', 'text', '--tools', emptyArg, '--no-session-persistence', '--disable-slash-commands'];
  const llm: LlmFn = (prompt) => run(command, args, prompt, timeoutMs);
  let available: boolean | undefined;
  const availability = async () => {
    if (available !== undefined) return available;
    try {
      await run(command, ['--version'], '', 15000);
      available = true;
    } catch {
      available = false;
    }
    return available;
  };
  return new LlmProvider('Claude Code CLI', llm, availability);
}
