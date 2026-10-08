import type { AppState, CompanyView, SheetPreview } from '../shared/api';

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-contact-assist': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `エラー (${res.status})`);
  return json as T;
}

const q = (key: string) => `key=${encodeURIComponent(key)}`;

export const api = {
  state: () => call<AppState>('GET', '/api/state'),
  load: (path: string) => call<void>('POST', '/api/excel/load', { path }),
  pick: () => call<{ picked: boolean }>('POST', '/api/excel/pick'),
  reload: () => call<void>('POST', '/api/excel/reload'),
  preview: (sheet: string, role: 'company' | 'templates', orientation: 'rows' | 'columns') =>
    call<SheetPreview>('GET', `/api/structure/preview?sheet=${encodeURIComponent(sheet)}&role=${role}&orientation=${orientation}`),
  saveMapping: (body: unknown) => call<void>('POST', '/api/mapping', body),
  clearMapping: () => call<void>('DELETE', '/api/mapping'),
  resolveConflict: (conflictId: string, candidateId: string) => call<void>('POST', '/api/master/resolve', { conflictId, candidateId }),
  clearConflictChoices: () => call<void>('DELETE', '/api/master/resolve'),
  company: (key: string) => call<CompanyView>('GET', `/api/company?${q(key)}`),
  research: (key: string, mode: 'full' | 'form' | 'ai') => call<void>('POST', `/api/company/research?${q(key)}`, { mode }),
  override: (key: string, patch: Record<string, unknown>) => call<void>('POST', `/api/company/override?${q(key)}`, { patch }),
  openForm: (key: string, where: 'controlled' | 'default') => call<{ url: string }>('POST', `/api/company/open-form?${q(key)}`, { where }),
  reanalyzeCurrent: (key: string) => call<void>('POST', `/api/company/reanalyze-current?${q(key)}`),
  openUrl: (url: string) => call<void>('POST', '/api/open-url', { url }),
  startQueue: (key: string) => call<void>('POST', `/api/queue/start?${q(key)}`),
  stopQueue: () => call<void>('POST', '/api/queue/stop'),
  setAi: (enabled: boolean) => call<void>('POST', '/api/settings/ai', { enabled }),
  logs: () => call<{ file: string; lines: string[] }>('GET', '/api/logs'),
};
