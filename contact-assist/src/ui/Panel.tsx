import type { PlanCandidate, PlanItem } from '../shared/types';
import type { TransferItem } from '../shared/api';
import { CopyButton } from './CopyButton';

interface CopyCtx {
  isCopied: (id: string) => boolean;
  markCopied: (id: string) => void;
}

const ReqBadge = ({ r }: { r: boolean | 'unknown' }) =>
  r === true ? <span className="badge req">【必須】</span> : r === false ? <span className="badge opt">【任意】</span> : <span className="badge unk">【必須/任意 不明】</span>;

/** 値の表示。空白や改行がそのまま分かるように pre-wrap で表示する（表示値＝コピー値） */
function ValueBox({ value, long }: { value: string; long?: boolean }) {
  return <pre className={`value${long ? ' long' : ''}`}>{value}</pre>;
}

function Candidate({ c, ctx, itemId }: { c: PlanCandidate; ctx: CopyCtx; itemId: string }) {
  const id = `${itemId}:${c.id}`;
  return (
    <div className="cand">
      <div className="cand-label">
        {c.recommended ? <span className="badge rec">推奨</span> : null}
        {c.label}
      </div>
      <ValueBox value={c.value} />
      <CopyButton value={c.value} copied={ctx.isCopied(id)} onCopied={() => ctx.markCopied(id)} />
    </div>
  );
}

export function PlanItemCard({ item, ctx }: { item: PlanItem; ctx: CopyCtx }) {
  const isBody = item.std === 'body';
  const cls = ['item', `st-${item.status}`, item.issue ? 'has-issue' : '', item.lowConfidence ? 'low' : ''].join(' ');
  return (
    <div className={cls}>
      <div className="item-head">
        <ReqBadge r={item.required} />
        <span className="item-label">{item.label}</span>
        {item.std !== 'unknown' && <span className="std">（{item.stdLabel}）</span>}
        {item.lowConfidence && <span className="badge warn">分類要確認</span>}
      </div>
      {item.conditionChips.length > 0 && (
        <div className="chips">
          {item.conditionChips.map((c) => (
            <span key={c} className={`chip${c.includes('不明') ? ' unknown' : ''}`}>{c}</span>
          ))}
        </div>
      )}

      {item.status === 'ok' && item.value !== undefined && (
        <div className={`value-row${isBody ? ' body-row' : ''}`}>
          <ValueBox value={item.value} long={isBody} />
          <CopyButton
            value={item.value}
            big={isBody}
            label={isBody ? '本文をコピー' : 'コピー'}
            copied={ctx.isCopied(item.id)}
            onCopied={() => ctx.markCopied(item.id)}
          />
        </div>
      )}

      {item.status === 'candidates' && item.candidates && (
        <div className="cands">
          <div className="confirm-note">要確認：形式を確定できません。{item.note}</div>
          {item.candidates.map((c) => (
            <Candidate key={c.id} c={c} ctx={ctx} itemId={item.id} />
          ))}
        </div>
      )}

      {item.status === 'need-confirm' && (
        <div className="confirm-note strong">
          {item.issue ?? '要確認'}：{item.note}
          {item.candidates?.map((c) => (
            <div key={c.id} className="cand">
              <div className="cand-label">{c.label}</div>
              <ValueBox value={c.value} />
              <CopyButton value={c.value} copied={ctx.isCopied(`${item.id}:${c.id}`)} onCopied={() => ctx.markCopied(`${item.id}:${c.id}`)} />
            </div>
          ))}
        </div>
      )}

      {item.status === 'choose' && item.choice && (
        <div className="choice">
          <div className={`choice-action${item.choice.matched ? '' : ' confirm'}`}>{item.choice.action}</div>
          <div className="choice-hint">※選択は人間が行います（アプリは選択しません）</div>
          {item.choice.options.length > 0 && (
            <details>
              <summary>選択肢を見る（{item.choice.options.length}）</summary>
              <ul className="options">
                {item.choice.options.map((o) => (
                  <li key={o} className={o === item.choice?.matched ? 'matched' : ''}>{o}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {item.status === 'missing' && <div className="missing">{item.note}</div>}
      {item.status === 'unknown-field' && <div className="unknown-note">{item.note}</div>}
      {item.status === 'info' && <div className="info-note">{item.note}</div>}

      {item.charCheck && (
        <div className={`charcheck${item.charCheck.ok ? ' ok' : ' ng'}`}>
          文字数：{item.charCheck.count}　上限：{item.charCheck.limit ?? '不明（記載なし）'}　{item.charCheck.ok ? '入力可能：✓' : '文字数制限：超過（短縮はしません）'}
          {item.charCheck.limit !== null && <span className="src">（上限の根拠: {item.charCheck.limitSource}）</span>}
        </div>
      )}
      {item.warnings.map((w) => (
        <div key={w} className="warn-line">⚠ {w}</div>
      ))}
      {item.status === 'ok' && item.note && <div className="note-line">{item.note}</div>}
      {item.status === 'choose' && item.note && <div className="note-line">{item.note}</div>}
    </div>
  );
}

export function TransferSection({ items, ctx }: { items: TransferItem[]; ctx: CopyCtx }) {
  return (
    <section className="card transfer">
      <h3>Excel転記用 <small>（Excelへは人間が貼り付けます。アプリはExcelを書き換えません）</small></h3>
      {items.map((t) => (
        <div key={t.id} className="transfer-row">
          <div className="t-label">{t.label}</div>
          <pre className="value small">{t.value === '' ? `（${t.note ?? '空'}）` : t.value}</pre>
          <CopyButton value={t.value} disabled={t.value === ''} copied={ctx.isCopied(t.id)} onCopied={() => ctx.markCopied(t.id)} />
          {t.value !== '' && t.note && <div className="note-line">{t.note}</div>}
        </div>
      ))}
    </section>
  );
}
