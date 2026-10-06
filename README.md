# アジサイ

就労継続支援B型事業所むけの、利用者・支援員・管理者ツール（プロトタイプ）。

- **公開URL（GitHub Pages）**: https://riorio513.github.io/ajisai/
- 1ファイル（`index.html`）で動く静的プロトタイプ。インストール不要。
- データはブラウザ内（localStorage）に保存され、サーバーには送信されません。
- 本番は Next.js / Supabase / Vercel を想定（このリポジトリはその見本）。

## ログイン（体験版）

| ロール | 方法 |
|--------|------|
| 利用者 | 名前を選び、パスワードを決めて入る（何でもOK） |
| 支援員 | メールそのままでログイン |
| 管理者 | そのままログイン |

## ロゴ

`logo.png`（透過PNG）をこのフォルダに置くと、自動でロゴが表示されます。

## 更新の流れ

ファイルを編集 → コミット → push すると、GitHub Pages が自動で更新されます。

## 開発用語辞典（`dictionary/`）

Claude Code・Codex・Git・GitHub・デプロイ・AIエージェント・MCP などの用語やコマンドを、**貼り付けるだけで一発検索**できるデジタル辞典です（約630語）。

- **URL**: https://riorio513.github.io/ajisai/dictionary/ （mainにマージ後、GitHub Pagesで公開）
- 手元で開く場合は `dictionary/index.html` をブラウザで開くだけ（インストール不要）。
- 検索しなくても、**五十音順／ABC順／カテゴリ別の索引**から引けます（ジャンプバー付き）。
- 検索欄にコマンドや用語をそのまま貼り付けると、全角/半角・大文字小文字・カタカナ/ひらがな・ハイフンの有無を無視して検索し、強い一致なら自動で説明を開きます。
  - 例: `git push origin main` / `AGENTS.md` / `--dangerously-skip-permissions` / `$ npm run build` / `プルリク` / `デブロイ`（表記ゆれもOK）
- **エラーメッセージもそのまま貼り付けて引けます**（`Prompt is too long` / `npm ERR! code ERESOLVE` / `! [rejected] main -> main (non-fast-forward)` / `ECONNREFUSED` など）。Claude Code のツール名・設定キー・環境変数（`Bash(...)` / `permissions.deny` / `BASH_DEFAULT_TIMEOUT_MS` など）も収録。
- 説明文の中に出てくる他の用語（点線の下線）は、クリックでその項目へ飛べます。
- `https://…/dictionary/#q=git%20push` のように、検索語つきURLで共有できます。

### 用語を追加・修正するには

`dictionary/data/*.js` に1語1行（1ブロック）で書きます。カテゴリごとにファイルが分かれています。

```js
T("git", "branch", "ぶらんち",
  "git branch|ブランチ|枝",            // 別名・表記ゆれ・コピペされそうな形（| 区切り）
  "履歴の枝分かれ。",                   // 一言説明
  "詳しい説明…",                        // 詳細
  "git branch\ngit branch -d <name>",  // 使い方・例（任意）
  "checkout|merge");                    // 関連用語（任意）
```

説明文に出てくるのに単独の項目がない語は、`node dictionary/tools/find-gaps.js` で洗い出せます（出力から実際に調べたくなる専門用語を追加）。

新しいカテゴリやファイルを足したら、`dictionary/data/core.js` の `CATS` と `dictionary/index.html` の `<script>` を更新してください。
※ Claude Code / Codex は更新が速いため、コマンド名やオプションは公式ドキュメントも確認してください。
