// テスト用: フォームに対する一切の操作・変更を記録する（解析コードが何もしていないことの確認用）
window.__probe = { events: [], mutations: [] };
['input','change','click','submit','focus','focusin','keydown','keyup','keypress','paste','beforeinput','mousedown','mouseup','select','reset','invalid','dblclick','contextmenu'].forEach(function (t) {
  document.addEventListener(t, function (e) {
    window.__probe.events.push(t + ':' + ((e.target && (e.target.name || e.target.id || e.target.tagName)) || ''));
  }, true);
});
new MutationObserver(function (list) {
  list.forEach(function (x) {
    window.__probe.mutations.push(x.type + ':' + (x.attributeName || '') + ':' + ((x.target && (x.target.name || x.target.id || x.target.nodeName)) || ''));
  });
}).observe(document.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
window.__snapshotValues = function () {
  var out = [];
  document.querySelectorAll('input, select, textarea').forEach(function (el) {
    out.push([el.name || el.id, el.type, el.value, el.checked === true, el.selectedIndex]);
  });
  return JSON.stringify(out);
};
