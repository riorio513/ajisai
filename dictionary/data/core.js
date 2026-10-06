/* 用語データのコア。各 data/*.js から T(...) で用語を登録します。
   T(カテゴリ, 用語, 読み(ひらがな), 別名/表記ゆれ("|"区切り), 一言説明, 詳しい説明, 使い方・例(改行区切り), 関連用語("|"区切り))
   別名には「コピペされそうな形」（コマンド全体・英語名・カタカナ・略称）を全部入れておくと、貼り付けだけでヒットします。 */
window.CATS = [
  ["git",    "Git"],
  ["github", "GitHub"],
  ["deploy", "デプロイ・CI/CD・インフラ"],
  ["agent",  "AIエージェント・LLM"],
  ["claude", "Claude Code"],
  ["codex",  "Codex"],
  ["mcp",    "MCP・連携ツール"],
  ["term",   "ターミナル・コマンド"],
  ["error",  "エラー・メッセージ"],
  ["dev",    "開発一般・Web"]
];
window.DICT = [];
window.T = function (cat, term, reading, aliases, short, desc, usage, related) {
  window.DICT.push({
    cat: cat, term: term, reading: reading || "",
    aliases: aliases ? aliases.split("|").map(function (s) { return s.trim(); }).filter(Boolean) : [],
    short: short || "", desc: desc || "",
    usage: usage ? String(usage).replace(/^\n+|\n+$/g, "") : "",
    related: related ? related.split("|").map(function (s) { return s.trim(); }).filter(Boolean) : []
  });
};
