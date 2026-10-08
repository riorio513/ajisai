import { useEffect, useMemo, useState } from 'react';
import type { AppState, SheetPreview } from '../shared/api';
import type { MasterConflict, StructureProblem } from '../shared/types';
import { api } from './api';

// ───────── Excel を選ぶ画面 ─────────
export function LoadScreen({ state, onLoaded, onError }: { state: AppState | null; onLoaded: () => void; onError: (m: string) => void }) {
  const [path, setPath] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onLoaded();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="load-screen">
      <h1>お問い合わせ入力支援</h1>
      <p className="lead">Excelを選ぶと、企業ごとに「調査 → 入力値の用意 → コピー」までを手伝います。入力・認証・送信は人間が行います。</p>
      {state?.platform === 'win32' && (
        <button className="primary big" disabled={busy} onClick={() => run(() => api.pick())}>
          Excelファイルを選ぶ…
        </button>
      )}
      <div className="path-row">
        <input
          type="text"
          value={path}
          placeholder='Excelファイルの場所を貼り付け（例: C:\Users\...\営業リスト.xlsx）'
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && path && run(() => api.load(path))}
        />
        <button className="primary" disabled={busy || !path} onClick={() => run(() => api.load(path))}>読み込む</button>
      </div>
      <p className="hint">ヒント: エクスプローラーでファイルを Shift+右クリック →「パスのコピー」で、そのまま貼り付けられます（引用符つきでもOK）。</p>
      {state?.recent[0] && (
        <button className="link" disabled={busy} onClick={() => run(() => api.load(state.recent[0].path))}>
          前回のファイルを開く: {state.recent[0].path}
        </button>
      )}
      {busy && <p>読み込み中…</p>}
    </div>
  );
}

// ───────── Excel構造の確認画面 ─────────
const COMPANY_FIELDS: [string, string, boolean][] = [
  ['name', '企業名', true], ['url', '企業URL（公式サイト）', false], ['industry', '業界', false], ['job', '職種', false],
  ['memo', 'memo', false], ['templateNo', '文面番号', false], ['judgement', '判定', false],
];
const TEMPLATE_FIELDS: [string, string, boolean][] = [
  ['body', '本文', true], ['job', '職種', true], ['subject', '件名', false], ['number', '文面番号', false],
  ['target', '想定ターゲット', false], ['price', '採用単価', false],
];

function colLabel(c: number): string {
  let n = c;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function TableMapper({ role, sheets, state, onDone, onError }: { role: 'company' | 'templates'; sheets: string[]; state: AppState; onDone: () => void; onError: (m: string) => void }) {
  const fields = role === 'company' ? COMPANY_FIELDS : TEMPLATE_FIELDS;
  const initial = (role === 'company' ? state.structure?.companyTable?.sheet : state.structure?.templateTable?.sheet) ?? '';
  const [sheet, setSheet] = useState(initial);
  const [orientation, setOrientation] = useState<'rows' | 'columns'>('rows');
  const [preview, setPreview] = useState<SheetPreview | null>(null);
  const [headerRow, setHeaderRow] = useState(0);
  const [cols, setCols] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    if (!sheet) return;
    api.preview(sheet, role, orientation).then((p) => {
      setPreview(p);
      setHeaderRow(p.suggestedHeaderRow);
      setCols(Object.fromEntries(Object.entries(p.suggested).map(([k, v]) => [k, v])));
    }).catch((e) => onError(e.message));
  }, [sheet, orientation, role]);

  const headerCells = preview?.rows[headerRow] ?? [];
  const submit = async () => {
    try {
      const columns = Object.fromEntries(Object.entries(cols).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]));
      await api.saveMapping({ role, sheet, headerRow, columns, orientation });
      onDone();
    } catch (e) {
      onError((e as Error).message);
    }
  };
  return (
    <div className="mapper">
      <label>
        シート：
        <select value={sheet} onChange={(e) => setSheet(e.target.value)}>
          <option value="">選んでください</option>
          {sheets.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {role === 'templates' && (
        <label>
          並び方：
          <select value={orientation} onChange={(e) => setOrientation(e.target.value as 'rows' | 'columns')}>
            <option value="rows">文面が縦に並んでいる（1行 = 1文面）</option>
            <option value="columns">文面が横に並んでいる（1列 = 1文面）</option>
          </select>
        </label>
      )}
      {preview && (
        <>
          <label>
            見出しの行：
            <select value={headerRow} onChange={(e) => setHeaderRow(Number(e.target.value))}>
              {preview.rows.map((_, i) => <option key={i} value={i}>{i + 1}行目</option>)}
            </select>
          </label>
          <div className="preview">
            <table>
              <tbody>
                {preview.rows.slice(0, 15).map((r, i) => (
                  <tr key={i} className={i === headerRow ? 'hdr' : ''}>
                    <th>{i + 1}</th>
                    {r.slice(0, 14).map((c, j) => <td key={j}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="field-pickers">
            {fields.map(([key, label, req]) => (
              <label key={key}>
                {label}{req ? '（必須）' : ''}に使う列：
                <select value={cols[key] ?? ''} onChange={(e) => setCols({ ...cols, [key]: e.target.value === '' ? '' : Number(e.target.value) })}>
                  <option value="">使わない / なし</option>
                  {headerCells.map((c, j) => (c.trim() ? <option key={j} value={j}>{colLabel(j)}列：{c}</option> : null))}
                </select>
              </label>
            ))}
          </div>
          <button className="primary" onClick={submit} disabled={!sheet}>この設定で読み込む（保存されます）</button>
        </>
      )}
    </div>
  );
}

function MasterPicker({ sheets, onDone, onError }: { sheets: string[]; onDone: () => void; onError: (m: string) => void }) {
  const [sheet, setSheet] = useState('');
  return (
    <div className="mapper">
      <label>
        問い合わせ情報（送信者の会社名・氏名・電話・メール等）が書いてあるシート：
        <select value={sheet} onChange={(e) => setSheet(e.target.value)}>
          <option value="">選んでください</option>
          {sheets.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <button className="primary" disabled={!sheet} onClick={() => api.saveMapping({ role: 'master', sheet }).then(onDone).catch((e) => onError(e.message))}>
        このシートを使う
      </button>
    </div>
  );
}

export function StructureConfirm({ state, onDone, onError }: { state: AppState; onDone: () => void; onError: (m: string) => void }) {
  const st = state.structure!;
  const byRole = (r: StructureProblem['role']) => st.problems.filter((p) => p.role === r);
  const roleName = { company: '企業一覧', templates: '文面一覧', master: '問い合わせ情報' } as const;
  return (
    <div className="structure-screen">
      <div className="banner error">
        <h2>Excel構造確認が必要</h2>
        <p>Excelの中身から、必要な情報の場所を安全に特定できませんでした。推測で進めず、ここで教えてください（一度確認すると保存され、次回以降は自動で再検証して使います）。</p>
      </div>
      <h3>見つかったシートと判定</h3>
      <table className="sheets">
        <thead><tr><th>シート</th><th>判定した役割</th><th>企業一覧らしさ</th><th>問い合わせ情報らしさ</th><th>文面らしさ</th></tr></thead>
        <tbody>
          {st.sheets.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{{ company: '企業一覧', master: '問い合わせ情報', templates: '文面一覧', unknown: '不明' }[s.role]}{s.note ? `（${s.note}）` : ''}</td>
              <td>{s.scores.company}</td><td>{s.scores.master}</td><td>{s.scores.templates}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(['company', 'templates', 'master'] as const).map((role) =>
        byRole(role).length ? (
          <section key={role} className="card">
            <h3>{roleName[role]}</h3>
            {byRole(role).map((p) => <p key={p.message} className="problem">⚠ {p.message}{p.candidates?.length ? `（候補: ${p.candidates.join(' / ')}）` : ''}</p>)}
            {role === 'master' ? (
              <MasterPicker sheets={state.sheetNames} onDone={onDone} onError={onError} />
            ) : (
              <TableMapper role={role} sheets={state.sheetNames} state={state} onDone={onDone} onError={onError} />
            )}
          </section>
        ) : null,
      )}
      {st.mappingNotes.length > 0 && <ul className="notes">{st.mappingNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
    </div>
  );
}

// ───────── マスターデータ矛盾の解決 ─────────
export function ConflictPanel({ conflicts, onDone, onError }: { conflicts: MasterConflict[]; onDone: () => void; onError: (m: string) => void }) {
  return (
    <div className="banner error conflict">
      <h2>マスターデータ矛盾</h2>
      <p>問い合わせ情報（Excel）に、同じ意味で値が食い違う項目があります。どちらが正しいか選んでください。<br />選択はこのPCにだけ保存され、元のExcelは変更しません。解決するまでこのExcelでは入力支援を使えません。</p>
      {conflicts.map((c) => (
        <div key={c.id} className="conflict-item">
          <h4>{c.title}</h4>
          {c.candidates.map((cand, i) => (
            <div key={cand.id} className="conflict-cand">
              <span className="cand-no">候補{i + 1}：</span>
              <code className="cand-val">{cand.display}</code>
              <span className="cand-src">{cand.label}</span>
              <button className="primary" onClick={() => api.resolveConflict(c.id, cand.id).then(onDone).catch((e) => onError(e.message))}>この値を使う</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function QualityPanel({ state }: { state: AppState }) {
  const [open, setOpen] = useState(false);
  const counts = useMemo(() => ({
    error: state.quality.filter((q) => q.severity === 'error').length,
    warning: state.quality.filter((q) => q.severity === 'warning').length,
  }), [state.quality]);
  if (state.quality.length === 0) return null;
  return (
    <div className="quality">
      <button className="link" onClick={() => setOpen(!open)}>
        データ品質チェック：{counts.error ? `エラー${counts.error}件 ` : ''}{counts.warning ? `警告${counts.warning}件 ` : ''}（{open ? '閉じる' : '表示'}）
      </button>
      {open && (
        <ul>
          {state.quality.map((q, i) => (
            <li key={i} className={q.severity}>
              {q.severity === 'error' ? '✖' : q.severity === 'warning' ? '⚠' : 'ℹ'} {q.message}{q.where ? `（${q.where}）` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 問い合わせ情報を、どの項目として・どのセルから読んだかの一覧（Excelの項目のズレに気づくため） */
export function MasterReading({ state }: { state: AppState }) {
  if (state.masterReading.length === 0) return null;
  return (
    <details className="master-reading">
      <summary>問い合わせ情報の読み取り結果（どのセルを使ったか）</summary>
      <p className="hint">Excelの項目がズレていないか確認できます。セル番号がおかしい項目は、Excelを直して「Excelを再読込」してください。</p>
      <table>
        <tbody>
          {state.masterReading.map((r) => (
            <tr key={r.field}>
              <th>{r.label}</th>
              <td className="v">{r.value}</td>
              <td className="c">{r.cells.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.masterUnclassified.length > 0 && (
        <p className="hint">読み取り対象にしなかった項目: {state.masterUnclassified.map((u) => u.label).join('、')}</p>
      )}
    </details>
  );
}
