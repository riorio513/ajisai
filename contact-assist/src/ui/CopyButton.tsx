import { useState } from 'react';

/** 表示している値そのものだけをクリップボードに入れる。余計な文字・改行・引用符は付けない */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // 古い環境向けの代替（選択してコピー）
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

interface Props {
  /** コピーする値（画面に表示している値と同一の文字列） */
  value: string;
  copied: boolean;
  onCopied: () => void;
  label?: string;
  big?: boolean;
  disabled?: boolean;
}

export function CopyButton({ value, copied, onCopied, label = 'コピー', big, disabled }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' done' : ''}${big ? ' big' : ''}${failed ? ' failed' : ''}`}
      disabled={disabled}
      onClick={async () => {
        const ok = await copyText(value);
        setFailed(!ok);
        if (ok) onCopied();
      }}
    >
      {failed ? 'コピー失敗' : copied ? '✓ コピー済み' : `[${label}]`}
    </button>
  );
}
