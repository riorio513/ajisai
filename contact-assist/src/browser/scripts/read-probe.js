// 診断用（テストで使用）: テスト用ダミーページが記録した「操作・変更の履歴」を読むだけ。何も書き込まない。
(() => {
  const p = window.__probe;
  if (!p) return null;
  return {
    events: p.events.slice(),
    mutations: p.mutations.slice(),
    values: typeof window.__snapshotValues === 'function' ? window.__snapshotValues() : null,
  };
})()
