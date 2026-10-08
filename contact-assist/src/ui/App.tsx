import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppState, CompanyRow, CompanyView } from '../shared/api';
import { STATUS } from '../shared/types';
import { api } from './api';
import { LoadScreen, StructureConfirm, ConflictPanel, QualityPanel, MasterReading } from './Screens';
import { PlanItemCard, TransferSection } from './Panel';
import { CopyButton } from './CopyButton';

const ICON: Record<CompanyRow['severity'], string> = { ok: '〇', warn: '△', error: '✖', pending: '・' };

export function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<CompanyView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const last = useRef({ state: '', view: '' });
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [queueLimit, setQueueLimit] = useState<string>('');

  const refresh = useCallback(async () => {
    try {
      const s = await api.state();
      const js = JSON.stringify(s);
      if (js !== last.current.state) {
        last.current.state = js;
        setState(s);
      }
    } catch (e) {
      setError(`サーバーに接続できません: ${(e as Error).message}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 1500);
    return () => clearInterval(t);
  }, [refresh]);

  // 読み込み直後などに、最初の企業（または前回の企業）を選ぶ
  useEffect(() => {
    if (!state?.loaded || state.structure?.status !== 'ok') return;
    if (!selected || !state.companies.some((c) => c.key === selected)) setSelected(state.companies[0]?.key ?? null);
  }, [state, selected]);

  const loadView = useCallback(async (key: string) => {
    try {
      const v = await api.company(key);
      const jv = JSON.stringify(v);
      if (jv !== last.current.view) {
        last.current.view = jv;
        setView(v);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!selected) return;
    void loadView(selected);
  }, [selected, state, loadView]);

  // 企業を変えたらコピー済みをリセット
  useEffect(() => {
    setCopied(new Set());
    last.current.view = '';
    setView(null);
  }, [selected]);

  const act = async (label: string, fn: () => Promise<unknown>) => {
    setActionBusy(label);
    setError(null);
    try {
      await fn();
      await refresh();
      if (selected) await loadView(selected);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionBusy(null);
    }
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  if (!state) return <div className="boot">{error ?? '読み込み中…'}</div>;

  const errorBar = error ? <div className="errbar" onClick={() => setError(null)}>⚠ {error}（クリックで閉じる）</div> : null;

  if (!state.loaded || choosing) {
    return (
      <>
        {errorBar}
        {choosing && <button className="back" onClick={() => setChoosing(false)}>← 作業に戻る</button>}
        <LoadScreen
          state={state}
          onLoaded={() => {
            setChoosing(false);
            setSelected(null);
            void refresh();
          }}
          onError={setError}
        />
      </>
    );
  }

  const header = (
    <header className="topbar">
      <strong>お問い合わせ入力支援</strong>
      <span className="path" title={state.excelPath}>{state.excelPath}</span>
      <button onClick={() => act('Excelを再読込中', () => api.reload())}>Excelを再読込</button>
      <span className={`pill ${state.ai.available ? 'on' : 'off'}`} title="迷う判断だけに使います。個人情報は送りません">
        AI: {state.ai.enabled ? (state.ai.available ? state.ai.name : '利用不可（要確認で進みます）') : 'オフ'}
      </span>
      <button onClick={() => api.setAi(!state.ai.enabled).then(refresh)}>{state.ai.enabled ? 'AIオフ' : 'AIオン'}</button>
      <button onClick={() => setChoosing(true)}>別のExcelを開く</button>
      <button onClick={async () => { const l = await api.logs(); alert(`ログの場所:\n${l.file}\n\n直近:\n${l.lines.slice(-15).join('\n')}`); }}>ログ</button>
      {state.busy && <span className="busy">⏳ {state.busy}</span>}
    </header>
  );

  if (state.structure?.status !== 'ok') {
    return (
      <>
        {header}
        {errorBar}
        <StructureConfirm state={state} onDone={() => refresh()} onError={setError} />
      </>
    );
  }

  const rows = state.companies.filter((c) => !filter || c.name.includes(filter));
  const idx = state.companies.findIndex((c) => c.key === selected);
  const go = (d: number) => {
    const n = state.companies[idx + d];
    if (n) setSelected(n.key);
  };
  const ctx = {
    isCopied: (id: string) => copied.has(id),
    markCopied: (id: string) => setCopied((s) => new Set(s).add(id)),
  };

  return (
    <>
      {header}
      {errorBar}
      {toast && <div className="toast">{toast}</div>}
      {state.diffMessages.length > 0 && (
        <div className="banner info">
          <strong>Excelの変更を検出しました</strong>
          <ul>{state.diffMessages.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      {state.conflicts.length > 0 && <ConflictPanel conflicts={state.conflicts} onDone={refresh} onError={setError} />}
      <div className="layout">
        <aside className="sidebar">
          <input className="search" placeholder="企業名で絞り込み" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="queue">
            {state.queue.running ? (
              <>
                <span>連続調査中 {state.queue.done}/{state.queue.total}</span>
                <button onClick={() => api.stopQueue().then(refresh)}>停止</button>
              </>
            ) : (
              <>
                <button disabled={!selected} onClick={() => selected && act('', () => api.startQueue(selected, queueLimit === '' ? undefined : Number(queueLimit)))} title="この企業から順に、未調査の企業を調査します（失敗しても次へ進みます）">
                  ここから順に連続調査
                </button>
                <label className="qlimit" title="空欄なら最後まで">
                  <input type="number" min={1} value={queueLimit} placeholder="全部" onChange={(e) => setQueueLimit(e.target.value)} />社まで
                </label>
              </>
            )}
          </div>
          <ul className="company-list">
            {rows.map((c) => (
              <li key={c.key} className={`${c.key === selected ? 'sel' : ''} sev-${c.severity}`} onClick={() => setSelected(c.key)}>
                <span className="no">{c.order + 1}</span>
                <span className="icon">{c.stage === 'running' ? '⏳' : ICON[c.severity]}</span>
                <span className="nm">{c.name}</span>
                <span className="stt">{c.status === STATUS.PENDING ? '' : c.status}</span>
              </li>
            ))}
          </ul>
          <QualityPanel state={state} />
          <MasterReading state={state} />
          <details className="settings">
            <summary>保存済みの設定</summary>
            <p className="hint">Excel構造の確認結果や、矛盾の選択をやり直したいときに使います（元のExcelは変わりません）。</p>
            {state.ignoreKeywords.length > 0 && (
              <div className="ignore-list">
                <div>無視する項目名:</div>
                {state.ignoreKeywords.map((k) => (
                  <span key={k} className="chip">{k} <button className="x" onClick={() => act('', () => api.ignore({ remove: k }))} title="無視をやめる">×</button></span>
                ))}
              </div>
            )}
            <button onClick={() => window.confirm('保存済みの列の対応づけを消して、自動判定からやり直します。よろしいですか？') && act('', () => api.clearMapping())}>列の対応づけをリセット</button>
            <button onClick={() => window.confirm('「マスターデータ矛盾」で選んだ内容を消します。よろしいですか？') && act('', () => api.clearConflictChoices())}>矛盾の選択をリセット</button>
          </details>
        </aside>
        <main className="main">
          {!view ? (
            <p>読み込み中…</p>
          ) : (
            <CompanyPanel
              view={view}
              state={state}
              ctx={ctx}
              busy={!!actionBusy || !!state.busy}
              onPrev={idx > 0 ? () => go(-1) : undefined}
              onNext={idx < state.companies.length - 1 ? () => go(1) : undefined}
              act={act}
              flash={flash}
              setError={setError}
            />
          )}
        </main>
      </div>
    </>
  );
}

// ───────── 企業パネル ─────────
interface PanelProps {
  view: CompanyView;
  state: AppState;
  ctx: { isCopied: (id: string) => boolean; markCopied: (id: string) => void };
  busy: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  act: (label: string, fn: () => Promise<unknown>) => Promise<void>;
  flash: (m: string) => void;
  setError: (m: string | null) => void;
}

function CompanyPanel({ view: v, state, ctx, busy, onPrev, onNext, act, flash }: PanelProps) {
  const key = v.key;
  const researched = v.stage === 'done';
  const noSales = v.status === STATUS.NO_SALES;
  return (
    <>
      <div className="company-head">
        <div className="progress">{v.order + 1} / {v.total}</div>
        <h2>{v.name}</h2>
        <div className={`status sev-${v.severity}`}>{v.status}</div>
        <div className="nav">
          <button disabled={!onPrev} onClick={onPrev}>◀ 前の企業</button>
          <button disabled={!onNext} onClick={onNext}>次の企業 ▶</button>
        </div>
      </div>

      <div className="actions">
        <button className="primary" disabled={busy} onClick={() => act('調査中', () => api.research(key, 'full'))}>{researched ? '現在企業を再調査' : '調査する'}</button>
        <button disabled={busy || !researched} onClick={() => act('フォーム再解析', () => api.research(key, 'form'))}>フォームを再解析</button>
        <button disabled={busy || !researched} onClick={() => act('AI判定', () => api.research(key, 'ai'))} title="ページは取り直さず、AIの判断だけをやり直します">AI判定だけ再実行</button>
        <span className="sep" />
        <button disabled={!v.contactUrl || busy || noSales} onClick={() => act('', async () => { await api.openForm(key, 'controlled'); flash('調査用のChromeでフォームを開きました'); })}>フォームを開く（調査用Chrome）</button>
        <button disabled={!v.contactUrl || noSales} onClick={() => api.openForm(key, 'default').catch((e) => flash(e.message))}>既定のブラウザで開く</button>
        <button disabled={busy || !researched || noSales} onClick={() => act('現在ページ再解析', () => api.reanalyzeCurrent(key))} title="確認画面などへ進んだあとに、いま開いているページを読み直します（アプリは画面を進めません）">現在ページを再解析</button>
      </div>

      {v.stage === 'running' && <div className="banner info">⏳ 調査中です。調査用のChromeが自動でページを巡回します（入力・送信は行いません）…</div>}
      {v.stage === 'pending' && <div className="banner">{v.statusMessage}</div>}

      {v.errorPanel && v.stage === 'done' && (
        <div className={`banner ${v.status === STATUS.NO_SALES ? 'error big' : v.severity === 'error' ? 'error' : 'warn'}`}>
          <h2>{v.errorPanel.title}</h2>
          <p><strong>理由：</strong>{v.errorPanel.reason}</p>
          {v.errorPanel.url && <p><strong>確認URL：</strong><a href={v.errorPanel.url} target="_blank" rel="noreferrer">{v.errorPanel.url}</a></p>}
          {v.errorPanel.quote && <p><strong>根拠：</strong>「{v.errorPanel.quote}」</p>}
          {v.errorPanel.instruction && <p className="instr">{v.errorPanel.instruction}</p>}
          {v.canConfirmForm && (
            <button className="primary" onClick={() => act('', () => api.override(v.key, { formConfirmed: true }))}>このフォームで問題ない（確認した）</button>
          )}
          {v.status === STATUS.SALES_UNCLEAR && (
            <button className="primary" onClick={() => act('', () => api.override(v.key, { salesConfirmed: true }))}>確認した（営業可として進める）</button>
          )}
        </div>
      )}

      {v.templateChoices && (
        <div className="banner warn">
          <strong>この職種には文面が複数あります。使う文面を選んでください：</strong>
          {v.templateChoices.map((t) => (
            <button key={t.id} onClick={() => act('', () => api.override(v.key, { templateId: t.id }))}>文面 {t.number || t.id}（{t.where}）</button>
          ))}
        </div>
      )}

      {researched && (
        <div className={`work${v.plan && !v.blocking ? ' two' : ''}`}>
          <div className="left">
            {!noSales && (
              <section className="card info-card">
                <dl>
                  <dt>判定</dt><dd><span className={`status sev-${v.severity}`}>{v.status}</span></dd>
                  <dt>職種</dt>
                  <dd>
                    <select
                      value={v.job.label ?? ''}
                      onChange={(e) => act('', () => api.override(v.key, { jobLabel: e.target.value }))}
                    >
                      <option value="">（未選択）</option>
                      {v.job.options.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
                    </select>
                    {v.job.exact === false && <span className="badge warn">近似職種</span>}
                    {v.job.by === 'manual' && <span className="badge opt">手動で選択</span>}
                  </dd>
                  <dt>文面</dt><dd>{v.template ? <strong className="big-no">{v.template.number || '（番号なし）'}</strong> : '未確定'} {v.template && <small>（{v.template.where}）</small>}</dd>
                  <dt>問い合わせURL</dt><dd className="url">{v.contactUrl ? <a href={v.contactUrl} target="_blank" rel="noreferrer">{v.contactUrl}</a> : '—'}</dd>
                  <dt>職種選定根拠</dt><dd>{v.job.reason || '—'}</dd>
                  <dt>営業禁止</dt>
                  <dd>
                    <span className={`badge ${v.solicitation.verdict === 'none' ? 'opt' : 'warn'}`}>{v.solicitation.label}</span>
                    {v.solicitation.verdict === 'none' && <small>　{v.solicitation.checkedUrls.length}ページを確認</small>}
                  </dd>
                  <dt>reCAPTCHA</dt>
                  <dd>{v.plan ? (v.plan.captcha.present ? <strong>あり（{v.plan.captcha.kinds.join('・')}）— 人間が処理します</strong> : 'なし') : '—'}</dd>
                  {v.site && (<><dt>公式サイト</dt><dd className="url"><a href={v.site.url} target="_blank" rel="noreferrer">{v.site.url}</a><br />{!v.site.verified && <span className="badge warn">企業名未確認</span>}<br /><small>{v.site.note}</small></dd></>)}
                </dl>
                {v.formInfo && v.formInfo.otherCandidates.length > 0 && (
                  <div className="other-forms">
                    このページには他にも入力フォームがあります：
                    {v.formInfo.otherCandidates.map((o) => (
                      <button key={o.index} onClick={() => act('', () => api.override(v.key, { formIndex: o.index }))}>フォーム{o.index + 1}（{o.fieldCount}欄）に切り替え</button>
                    ))}
                  </div>
                )}
              </section>
            )}
            <TransferSection items={v.transfer} ctx={ctx} />
            <section className="card">
              <details>
                <summary>調査の根拠（なぜこの職種か / 営業禁止の確認 / 確認したページ）</summary>
                <EvidenceList view={v} />
              </details>
              <details className="excel-ref">
                <summary>Excelにいま入っている値（参考）</summary>
                <ul>
                  <li>業界: {v.excelReference.industry || '—'}</li>
                  <li>職種: {v.excelReference.job || '—'}</li>
                  <li>文面番号: {v.excelReference.templateNo || '—'}</li>
                  <li>判定: {v.excelReference.judgement || '—'}</li>
                  <li>memo: {v.excelReference.memo || '—'}</li>
                </ul>
              </details>
            </section>
          </div>
          {v.plan && !v.blocking && (
            <div className="right">
              <section className="card form-panel">
                <h3>フォーム入力 <small>（フォームと同じ順番です。コピー → フォームで Ctrl+V の繰り返し）</small></h3>
                {v.plan.warnings.map((w) => <div key={w} className="warn-line">⚠ {w}</div>)}
                {v.plan.items.map((it) => <PlanItemCard key={it.id} item={it} ctx={ctx} onIgnore={(label) => act('', () => api.ignore({ add: label }))} />)}
                <div className="end-note">
                  送信・確認ボタン・reCAPTCHAは人間が操作します。{v.plan.submitLabels.length ? `（フォームのボタン: ${v.plan.submitLabels.join(' / ')}）` : ''}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
      {state.ai.enabled && !state.ai.available && researched && <div className="hint">AIが使えないため、判断が必要な箇所は「要確認」になります。</div>}
    </>
  );
}

function EvidenceList({ view }: { view: CompanyView }) {
  const groups: Record<string, typeof view.evidence> = {};
  for (const e of view.evidence) (groups[e.kind] ??= []).push(e);
  return (
    <div className="evidence">
      {Object.entries(groups).map(([kind, list]) => (
        <div key={kind}>
          <h5>{kind}</h5>
          <ul>
            {list.map((e, i) => (
              <li key={i}>
                <div className="snip">「{e.snippet}」</div>
                <div className="meta"><a href={e.url} target="_blank" rel="noreferrer">{e.url}</a>　{new Date(e.at).toLocaleString('ja-JP')}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {view.solicitation.checkedUrls.length > 0 && (
        <div>
          <h5>営業禁止の確認で読んだページ</h5>
          <ul>{view.solicitation.checkedUrls.map((u) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>)}</ul>
        </div>
      )}
      {view.steps.length > 0 && (
        <details>
          <summary>調査の経過</summary>
          <ol className="steps">{view.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </details>
      )}
      {view.researchedAt && <div className="meta">最終処理: {new Date(view.researchedAt).toLocaleString('ja-JP')}</div>}
    </div>
  );
}

export { CopyButton };
