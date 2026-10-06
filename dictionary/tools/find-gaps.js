#!/usr/bin/env node
/* 辞典の説明文に出てくるのに、単独の項目（用語名・別名）がない語を洗い出すスクリプト。
   使い方:  node dictionary/tools/find-gaps.js [最小出現回数=1]
   出力された語のうち、実際に調べたくなる専門用語を data/*.js に追加してください。 */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="(data\/[^"]+)"><\/script>/g)].map(m => m[1]);
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }));

const hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const norm = s => hira(s.normalize("NFKC").toLowerCase());
const sq = s => norm(s).replace(/[\s\-_・.\/\\"'`“”‘’「」『』()（）\[\]{}:：,，、。;；!！?？]+/g, "");

const D = ctx.DICT;
const known = new Set();
D.forEach(d => [d.term, ...d.aliases].forEach(k => known.add(sq(k))));

/* 一般的すぎる語・活用語尾などは無視 */
const IGNORE = new Set("the and for you your with from this that are not only can will use used using file files true false none yes null undefined true and or if in on of to a an is as at by it be do no ok my".split(" ").map(sq));

const freq = {}, sample = {};
function add(t, d) {
  const k = sq(t);
  if (k.length < 2 || known.has(k) || IGNORE.has(k) || /^v?\d/.test(k)) return;
  freq[k] = (freq[k] || 0) + 1;
  if (!sample[k]) sample[k] = { raw: t, in: d.term };
}
D.forEach(d => {
  const txt = d.short + " " + d.desc;
  (txt.match(/[ァ-ヺー]{3,}/g) || []).forEach(t => add(t, d));                       // カタカナ語
  (txt.match(/[A-Za-z][A-Za-z0-9.+#\-]{2,}(?: [A-Z][A-Za-z0-9]+)?/g) || []).forEach(t => add(t.replace(/-$/, ""), d)); // 英語・略語
  (txt.match(/[一-鿿]{2,}(?:攻撃|環境|管理|機能|方式|設定|情報|認証|通信|処理|設計)/g) || []).forEach(t => add(t, d)); // 漢字の複合語
});
const min = Number(process.argv[2] || 1);
const rows = Object.entries(freq).filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]);
console.log(`収録 ${D.length} 語 / 未収録の候補 ${rows.length} 語（出現${min}回以上）`);
rows.forEach(([k, n]) => console.log(`${String(n).padStart(3)}  ${sample[k].raw}   （例: ${sample[k].in}）`));
