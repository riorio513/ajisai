/* ===== Claude Code ===== */
T("claude","Claude Code","くろーどこーど","claude code|claude|claudeコマンド|クロードコード|Claude Code CLI|claude-code|@anthropic-ai/claude-code|claude.ai/code","Anthropicが提供する、ターミナル等で動くAIコーディングエージェント。",
"プロジェクトのフォルダで claude と打って起動し、日本語で「このバグを直して」「テストを書いて」と頼むと、ファイルを読み・編集し・コマンドを実行して作業する。ターミナル(CLI)のほか、VS Code/JetBrains拡張、デスクトップアプリ、Web版(claude.ai/code)、GitHub Actions連携などで使える。操作の許可は都度確認でき、設定で自動化もできる。",
`cd my-project
claude                      # 対話モードで起動
claude "READMEを要約して"     # 最初の指示つきで起動
claude -p "テストを実行して結果を要約"   # 1回だけ実行して終了`,"CLAUDE.md|スラッシュコマンド|パーミッションモード|サブエージェント|hooks|MCP");

T("claude","/help","へるぷ","/help|help|ヘルプ|使い方","使えるコマンドとショートカットのヘルプを表示する。","","/help","スラッシュコマンド");
T("claude","/clear","くりあ","/clear|clear|会話をリセット|履歴クリア|/reset|/new","会話履歴（コンテキスト）を空にして新しく始める。","別タスクに移る前に実行すると、前の話題が混ざらず精度とコストの面で有利。","/clear","/compact|コンテキスト");
T("claude","/compact","こんぱくと","/compact|compact|/compact 指示|会話の圧縮|要約して続行","会話を要約して圧縮し、コンテキストを空ける。","指示を添えると、残す内容を指定できる。","/compact\n/compact テスト結果と決定事項を残して","compact|コンテキスト");
T("claude","/init","いにっと","/init|init|CLAUDE.mdを作る|CLAUDE.md 生成","コードベースを調べて、CLAUDE.md の雛形を自動生成する。","最初に1回実行し、生成物を手で整えるのが定番。","/init","CLAUDE.md");
T("claude","/permissions","ぱーみっしょんず","/permissions|permissions|許可ルール|allow ルール|permission rules|権限設定|/allowed-tools","ツールの許可・確認・拒否ルールを表示・編集する。","「git status は毎回確認なしで許可」「rm は拒否」など、ルールを細かく管理できる。settings.json の permissions と同じもの。","/permissions","権限|settings.json|パーミッションモード");
T("claude","/config","こんふぃぐ","/config|config|設定画面|claude config|設定を開く|/settings","設定画面を開く（テーマ、モデル、通知など）。","","/config","settings.json");
T("claude","/status","すてーたす","/status|status|バージョン確認|アカウント情報|接続状態","バージョン、アカウント、使用モデル、接続状況などを表示する。","","/status","/doctor|/usage");
T("claude","/context","こんてきすと","/context|context usage|コンテキスト使用量|コンテキスト可視化","コンテキストウィンドウの使用状況（何がどれだけ占めているか）を可視化する。","","/context","コンテキスト|/compact");
T("claude","/doctor","どくたー","/doctor|doctor|claude doctor|環境診断|インストール診断","インストールや設定の健全性を診断する。","起動しない・更新できない等の不調時に最初に試す。","/doctor","claude(インストール)");
T("claude","/login","ろぐいん","/login|login|/logout|logout|ログイン|ログアウト|認証|アカウント切り替え","ログイン／アカウント切り替え。/logout でログアウト。","ブラウザの認証画面が開く。APIキー利用とサブスク利用で課金が変わる点に注意。","/login\n/logout","APIキー");
T("claude","/mcp","えむしーぴー","/mcp|mcp|MCP管理|MCPサーバー一覧|MCP認証|claude mcp list","接続中のMCPサーバーの状態確認・認証を行う。","","/mcp","MCP|claude mcp add");
T("claude","/memory","めもり","/memory|memory|メモリ編集|CLAUDE.md 編集|#でメモリ追加","CLAUDE.md（メモリ）ファイルを編集する。","","/memory","CLAUDE.md|メモリ");
T("claude","/hooks","ふっくす","/hooks|hooks設定|フック設定|hook を設定","hooks（自動実行フック）を設定する画面を開く。","","/hooks","hooks|settings.json");
T("claude","/resume","りじゅーむ","/resume|resume|--resume|-r|--continue|-c|claude --continue|claude --resume|claude -c|claude -r|前回の続き|会話を再開|セッション再開|セッション履歴","過去の会話（セッション）を選んで再開する。","ターミナルから claude --continue（直近を再開）、claude --resume（一覧から選択）でも同じことができる。","/resume\nclaude --continue\nclaude --resume","セッション|/clear");
T("claude","/add-dir","あっどでぃれくとり","/add-dir|--add-dir|add-dir|作業ディレクトリ追加|追加ディレクトリ|複数フォルダ","作業対象のフォルダを追加する（別ディレクトリのファイルも読み書きできるようにする）。","","/add-dir ../shared-lib\nclaude --add-dir ../shared-lib","権限");
T("claude","/ide","あいでぃーいー","/ide|ide|IDE連携|VS Code拡張|Claude Code VS Code extension|JetBrains|IDE integration|IDE統合","VS Code等のIDEと連携する。","拡張機能を入れると、IDEで開いているファイル・選択範囲・診断(エラー)をClaudeが参照でき、差分もIDEの画面で確認できる。","/ide","VS Code|Claude Code");
T("claude","/output-style","あうとぷっとすたいる","/output-style|output style|出力スタイル|Explanatory|Learning|学習モード|説明モード","Claudeの返答スタイル（解説多め・学習向けなど）を切り替える。","","/output-style","システムプロンプト");
T("claude","/statusline","すてーたすらいん","/statusline|status line|ステータスライン|statusLine|画面下部の表示|ステータス行","画面下部のステータス表示（ブランチ名・モデル・コスト等）をカスタマイズする。","","/statusline","settings.json");
T("claude","/plugin","ぷらぐいん","/plugin|plugin|plugins|プラグイン|marketplace|マーケットプレイス|プラグインを入れる|/plugin install|claude plugin","スキル・コマンド・サブエージェント・hooks・MCPなどを1つにまとめて配布・導入できる拡張パッケージ。","マーケットプレイス（配布元）を追加して、そこからインストールする。チームの標準構成を共有するのに便利。","/plugin\n/plugin marketplace add <repo>\n/plugin install <name>@<marketplace>","Skills|サブエージェント|hooks|MCP");
T("claude","/todos","とぅどぅー","/todos|todos|TodoWrite|ToDoリスト|タスクリスト|TODO list|進捗リスト","Claudeが管理しているToDoリスト（作業の段取りと進捗）を表示する。","複数ステップの作業では、Claudeは自分でToDoリストを作り、1つずつ消化していく。","/todos","エージェントループ");
T("claude","/export","えくすぽーと","/export|export|会話を書き出す|会話エクスポート|ログ保存|transcript","会話の内容をファイルやクリップボードに書き出す。","","/export","");
T("claude","/bug","ばぐ","/bug|bug|/feedback|feedback|不具合報告|フィードバック送信|/release-notes|release-notes|リリースノート","Claude Codeの不具合・フィードバックを送る。/release-notes で更新内容を確認。","","/feedback\n/release-notes","");
T("claude","/install-github-app","いんすとーるぎっとはぶあっぷ","/install-github-app|install-github-app|GitHub App 連携|GitHub Actions セットアップ|@claude を使えるようにする","リポジトリに Claude の GitHub App と Actions ワークフローをセットアップする。","これにより、IssueやPRのコメントで @claude とメンションして作業を依頼できる。","/install-github-app","Claude Code GitHub Actions|メンション|GitHub App");
T("claude","/fast","ふぁすと","/fast|fast mode|ファストモード|高速モード|出力高速化","同じ高性能モデルのまま、出力を高速化するモードの切り替え。","速度優先の設定で、品質は維持しつつレスポンスを速くする（料金体系は通常と異なる場合あり）。","/fast","/model");
T("claude","@ファイル参照","あっとふぁいるさんしょう","@file|@|ファイルを指定|file mention|@src/|@フォルダ|@ メンション|ファイルメンション|@ファイル名","プロンプトに「@パス」と書いて、特定のファイル・フォルダを読ませる。","「@src/auth.ts を見て、ログインのバグを直して」のように使う。Tabキーで補完でき、フォルダを指定すると一覧が渡る。","@src/components/Header.tsx のレイアウトを直して","コンテキスト|ショートカットキー");

T("claude","プランモード","ぷらんもーど","plan mode|Plan Mode|プラン|計画モード|--permission-mode plan|ExitPlanMode|read-only plan|プランを立てる|plan","コードを変更せず、調査して実装計画だけを立てさせるモード。",
"Shift+Tabで切り替え(または --permission-mode plan)。Claudeはファイルを読んで調べ、計画を提示する。人間が計画を承認するまで編集やコマンド実行は行わない。大きな変更・不慣れなコードベースで特に有効。","claude --permission-mode plan","パーミッションモード|推論|サブエージェント");

T("claude","--dangerously-skip-permissions","だんじゃらすりーすきっぷぱーみっしょんず","--dangerously-skip-permissions|dangerously-skip-permissions|bypassPermissions|YOLO|yolo|許可を全部スキップ|全部許可|確認なしで実行|permissions スキップ","すべての承認確認を無効にして、Claudeが自動で何でも実行するようになる危険なオプション。",
"名前の通り危険：ファイル削除、秘密情報の読み取り、外部送信、プロンプトインジェクションによる乗っ取り等のリスクが直撃する。使うなら、使い捨てのコンテナ/VM・ネットワーク制限・Git管理下・秘密情報なしの環境に限る。",
`claude --dangerously-skip-permissions   # 隔離環境でのみ！`,"パーミッションモード|サンドボックス|プロンプトインジェクション|Docker");

T("claude","--allowedTools","あろーどつーるず","--allowedTools|--disallowedTools|allowedTools|disallowedTools|allow|deny|Bash(git:*)|Bash(npm run test:*)|Read(.env)|ツール許可|許可リスト|拒否リスト|permissions.allow|permissions.deny|ツールを許可","自動で許可（または禁止）するツール・コマンドを指定するオプション/設定。",
"Bash(git status) のようにツール名と引数パターンを書く。非対話(-p)実行や、毎回の確認を減らしたいときに、安全なコマンドだけを事前許可するのが基本。denyで危険な操作(rm -rf、.envの読み取り)を封じる。",
`claude -p "テストを実行して" --allowedTools "Bash(npm test)" "Read"
// settings.json
{ "permissions": { "allow": ["Bash(git status)"], "deny": ["Read(./.env)"] } }`,"権限|settings.json|claude -p");

T("claude","settings.json","せってぃんぐすじぇいそん","settings.json|settings.local.json|.claude/settings.json|~/.claude/settings.json|.claude/settings.local.json|managed settings|Claude Code 設定ファイル|設定ファイル|permissions|env|hooks 設定|settings","Claude Codeの設定ファイル（権限・環境変数・hooks・モデルなど）。",
"3階層：ユーザー全体(~/.claude/settings.json)／プロジェクト共有(.claude/settings.json＝Gitにcommitしてチーム共有)／プロジェクト個人用(.claude/settings.local.json＝commitしない)。組織の強制設定(managed settings)もある。優先順位は新しい・狭い範囲ほど強いが、組織設定が最優先。",
`{
  "permissions": {
    "allow": ["Bash(npm run test:*)"],
    "deny":  ["Read(./.env)"]
  },
  "env": { "NODE_ENV": "development" }
}`,"権限|hooks|/permissions|/config");

T("claude","ツール(Claude Code)","つーる","Read|Write|Edit|MultiEdit|Bash|Glob|Grep|WebFetch|WebSearch|TodoWrite|NotebookEdit|Task|Agent|ツール一覧|built-in tools|組み込みツール|Claude Code tools","Claude Codeが使える組み込みの道具（ファイル読み書き・検索・コマンド実行など）。",
"Read=ファイルを読む／Write=新規作成・上書き／Edit=部分編集／Glob=ファイル名検索／Grep=内容検索／Bash=シェルコマンド実行／WebFetch=URL取得／WebSearch=Web検索／TodoWrite=ToDo管理／Task(Agent)=サブエージェント起動／NotebookEdit=Jupyter編集。権限ルールはこの名前を使って書く（例：Edit、Bash(npm test)）。","Bash(git diff:*)","権限|--allowedTools|MCP");

T("claude","MCPサーバー追加","えむしーぴーさーばーついか","claude mcp add|claude mcp list|claude mcp remove|claude mcp get|claude mcp add-json|.mcp.json|--scope|-s user|--scope project|--transport http|--transport sse|claude mcp serve|mcp.json|MCPを追加|MCP設定","Claude CodeにMCPサーバー（外部ツール連携）を追加・管理するコマンドと設定。",
"スコープ：local（自分・このプロジェクト）／project（.mcp.json＝チーム共有）／user（自分の全プロジェクト）。リモートサーバーは --transport http、ローカルプロセスは stdio（コマンド起動）で接続する。",
`claude mcp add --transport http github https://example.com/mcp
claude mcp add my-server -- npx -y some-mcp-server
claude mcp list
claude mcp remove my-server
# .mcp.json（プロジェクトで共有）
{ "mcpServers": { "my-server": { "command": "npx", "args": ["-y","some-mcp-server"] } } }`,"MCP|/mcp|.mcp.json|権限");

T("claude","Claude Code GitHub Actions","くろーどこーどぎっとはぶあくしょんず","claude-code-action|anthropics/claude-code-action|@claude|Claude GitHub Actions|Claude Code Action|/install-github-app|GitHub連携|PRで@claude","GitHubのIssue/PRで @claude とメンションすると、Claude Codeが自動で作業してくれる連携。",
"/install-github-app で導入できる。「@claude このIssueを実装して」でPRを作成、「@claude レビューして」でコードレビュー、といった使い方。APIキーなどをGitHub Secretsに登録して使う。実行権限は絞り、結果は必ず人間がレビューする。",
`# .github/workflows/claude.yml（概略）
uses: anthropics/claude-code-action@v1
with:
  anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}`,"GitHub Actions|メンション|secrets|/install-github-app");

T("claude","Checkpoints","ちぇっくぽいんと","checkpoint|checkpoints|チェックポイント|自動セーブ|コード巻き戻し|restore checkpoint","Claudeが編集する前に自動で取る、ファイルの状態のスナップショット。","/rewind か Esc Esc で呼び出し、会話・コード・両方のどれを戻すか選べる。Gitの代わりではなく補助。","","/rewind|git reset|git commit");

T("claude","セッション","せっしょん","session|セッション|session id|--session-id|会話セッション|~/.claude/projects|transcript|セッション履歴|session history|fork","Claude Codeでの1つの会話のまとまり。履歴は保存され、後から再開できる。","同じフォルダでの過去の会話は claude --continue / --resume で再開できる。別の流れで試したいときは分岐(fork)も可能。","claude --continue\nclaude --resume","/resume|/clear|コンテキスト");

T("claude","ANTHROPIC_API_KEY","あんそろぴっくえーぴーあいきー","ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_MODEL|ANTHROPIC_BASE_URL|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|DISABLE_TELEMETRY|MAX_THINKING_TOKENS|環境変数 Claude Code","Claude Codeが参照する主な環境変数。APIキーでの認証、モデル指定、AWS Bedrock/Google Vertex経由の利用切替などに使う。",
"ANTHROPIC_API_KEY=APIキー認証／ANTHROPIC_MODEL=既定モデル／CLAUDE_CODE_USE_BEDROCK・CLAUDE_CODE_USE_VERTEX=クラウド経由で利用／MAX_THINKING_TOKENS=思考トークン上限、など。settings.jsonの env でも設定可能。","export ANTHROPIC_API_KEY=\"sk-ant-...\"","APIキー|環境変数|settings.json");

T("claude","ultrathink","うるとらしんく","ultrathink|think|think hard|think harder|megathink|拡張思考キーワード|考えさせる","プロンプトに書くと、Claudeにより深く考えさせる合図となるキーワード。","think < think hard < ultrathink の順で思考量が増える（バージョンや設定によって挙動は異なる）。複雑な設計やバグ調査向けで、時間とトークンは増える。","ultrathink このバグの根本原因を調べて","推論|プランモード");

T("claude","バックグラウンド実行","ばっくぐらうんどじっこう","background task|background|run_in_background|バックグラウンドタスク|dev server|長時間コマンド|Ctrl+B|&|bashes|/bashes|バックグラウンドでコマンド","開発サーバーなど長く動き続けるコマンドを、裏で走らせながら作業を続ける機能。","Claudeはサーバーを起動したまま、ログを確認したり別の作業を進めたりできる。","","Bash|エージェントループ");

T("claude","Claude Code 画像貼り付け","がぞうはりつけ","画像貼り付け|スクリーンショット|paste image|Ctrl+V|image paste|画像をドラッグ|デザインカンプ|スクショを渡す","スクリーンショットやデザイン画像を貼り付けて、見た目を指示する機能。","ターミナルに画像をドラッグ＆ドロップ／貼り付け（Ctrl+V）すると、Claudeが画像を見て「この通りに直して」に応えられる。","","マルチモーダル");

T("claude","Claude Code 使い方のコツ","つかいかたのこつ","explore plan code commit|探索→計画→実装→コミット|TDD with Claude|テスト駆動|小さく頼む|コツ|best practices|ベストプラクティス|workflow","Claude Codeをうまく使う基本の流れ。","①まず調査(読むだけ)させる→②プランモードで計画→③実装→④テスト実行→⑤commit/PR。こまめに /clear や /compact、重要ルールは CLAUDE.md、危険操作は deny/hooks で守る。Gitで常に戻せる状態にしておく。","","プランモード|CLAUDE.md|/clear|git commit");

/* ===== 2026年版ドキュメントに基づく更新・追加（公式: code.claude.com/docs） ===== */
T("claude","claude(インストール)","くろーどいんすとーる","install claude code|npm install -g @anthropic-ai/claude-code|claude update|claude --version|claude -v|claude doctor|claude install|claude install stable|claude auth login|claude auth logout|claude auth status|claude setup-token|インストール|アップデート|native installer|ネイティブインストーラー|ログイン|サインイン","Claude Codeのインストール・更新・ログイン・診断に使うコマンド。",
"公式のインストーラ（macOS/Linux/WSLはcurlスクリプト、Windowsは専用スクリプトやWinGet等）か、Node.js環境ならnpmで入れる。claude install [version] でネイティブ版を入れ直し・バージョン指定（stable / latest / 2.1.x など）、claude update で更新。ログインは claude auth login（--console でAPI課金、--sso でSSO）。claude auth status で認証状況、claude setup-token はCI用の長期トークン発行。claude doctor は起動せずに診断。方法は更新されるので公式のセットアップページも確認。",
`npm install -g @anthropic-ai/claude-code
claude --version
claude update
claude install stable
claude auth login
claude auth status
claude doctor`,"Claude Code|/doctor|/login|APIキー");

T("claude","CLAUDE.md","くろーどえむでぃー","CLAUDE.md|claude.md|CLAUDE.local.md|./.claude/CLAUDE.md|.claude/CLAUDE.md|プロジェクトメモリ|project memory|メモリファイル|~/.claude/CLAUDE.md|クロードエムディー|プロジェクト指示","Claude Codeが起動時に必ず読み込む、プロジェクト専用の指示書（Markdown）。",
"リポジトリのルートに置き、プロジェクトの概要、よく使うコマンド（ビルド・テスト）、コーディング規約、やってはいけないことなどを書く。毎回説明する手間が省け、精度が安定する。置き場所は、ユーザー全体(~/.claude/CLAUDE.md)・プロジェクト(./CLAUDE.md または ./.claude/CLAUDE.md)・個人用(CLAUDE.local.md)・組織の管理ポリシー。見つかった全ファイルが連結されて渡され、プロジェクト直下のものは自動コンパクト後も再読込される。AGENTS.md しかない場合はそれを読む設定もあり（v2.1.277以降。/config の Project instructions）。/init で雛形を生成できる。",
`# CLAUDE.md の例
## コマンド
- テスト: npm test
- ビルド: npm run build
## ルール
- 回答は日本語
- mainへ直接pushしない
- .env は読まない・出力しない`,"/init|AGENTS.md|auto memory|.claude/rules|compact");

T("claude","スラッシュコマンド","すらっしゅこまんど","slash command|slash commands|/コマンド|スラッシュ|/ コマンド|スラッシュコマンド一覧|カスタムスラッシュコマンド|custom slash command|.claude/commands|コマンド一覧|commands|カスタムコマンド|custom commands|組み込みコマンド|built-in commands","Claude Codeの対話中に「/」で始めて実行する操作用コマンド（現在の公式用語は単に「コマンド」）。",
"/ を打つと候補が出る。/clear（会話リセット）、/compact（要約）、/model（モデル切替）、/permissions（許可設定）など。コマンドは行頭でのみ認識され、続く文字は引数になる。応答中に送ると、現在のターン終了後に実行（/status や /usage などは即時）。自作は .claude/commands/名前.md か .claude/skills/名前/SKILL.md に書くと /名前 で呼べるが、複数手順のものはスキル（Skills）が推奨。「/batch」「/code-review」「/debug」「/loop」などはプロンプト型の“同梱スキル”で、固定処理の組み込みコマンドとは別物。",
`/help
/clear
/compact
/model
/permissions`,"Skills|同梱スキル|/help|/clear|/compact");

T("claude","同梱スキル","どうこんすきる","bundled skills|Bundled skills|/batch|/code-review|/debug|/loop|/simplify|/run|/verify|/run-skill-generator|/update-config|/fewer-permission-prompts|/claude-api|/dataviz|/design|/slides|/claude-in-chrome|built-in skills","Claude Codeに最初から入っているプロンプト型のスキル（/batch・/code-review・/debug・/loop など）。",
"固定ロジックの組み込みコマンドと違い、詳細なプロンプトをClaudeに渡して、サブエージェント起動・ファイル読み込み・状況への適応をさせる。例：/batch（大規模変更を並列実行）、/code-review（差分レビュー）、/debug（デバッグログ有効化＋調査）、/loop（定期繰り返し）、/simplify（整理・簡素化）、/run と /verify（アプリを実際に起動して確認）、/update-config（設定変更）、/fewer-permission-prompts（許可プロンプトを減らす許可リスト提案）。※ 構成は版や環境で変わる。","/code-review high\n/simplify\n/loop 5m テスト結果を確認して","Skills|スラッシュコマンド|サブエージェント");

T("claude","/model","もでる","/model|model|モデル切り替え|モデル変更|--model|/model opus|/model sonnet|/model haiku|/model fable|opusplan|Opus|Sonnet|Haiku|Fable|モデルエイリアス|model alias","使用するモデルを切り替える（既定として保存される）。",
"claude --model <エイリアスまたは完全名> でも起動時に指定できる。エイリアスは sonnet / opus / haiku / fable など。対応モデルでは左右キーで effort level（思考の深さ）も調整できる。難しい設計は高性能モデル、単純作業は軽量モデル、と使い分けるとコストと速度が改善。Option+P / Alt+P でも切替。","/model\nclaude --model sonnet\nclaude --fallback-model sonnet,haiku","Claude|effort level|/effort|--fallback-model");

T("claude","/effort","えふぉーと","/effort|effort|--effort|effort level|エフォート|思考の深さ|ultracode|/effort high|/effort status|effortLevel","思考の深さ（effort level）を設定する。low / medium / high / xhigh / max / auto。",
"高いほど深く考える（遅く・トークンも増える）。/effort status で現在値、/effort ultracode でultracodeモードのオン/オフ。起動時は claude --effort high。対応はFableモデル、Opus 4.6以降、Sonnet 4.6以降など。以前の「think / ultrathink」キーワードに代わる考え方。","/effort high\n/effort status\nclaude --effort xhigh","effort level|extended thinking|ultrathink|/model");

T("claude","effort level","えふぉーとれべる","effort level|adaptive reasoning|適応的推論|アダプティブ|思考レベル|thinking effort|ultracode|MAX_THINKING_TOKENS|effortLevel","モデルが各ステップでどれだけ深く考えるかを決める設定。","高いほど思考トークンが増えて深い推論、低いほど速く安い。/effort、--effort、/model画面の左右キー、settings の effortLevel で設定。extended thinking（考える過程の表示）は effort で調整し、固定予算のモデルでは MAX_THINKING_TOKENS で上限を決める。","","/effort|extended thinking|推論");

T("claude","ショートカットキー","しょーとかっときー","Shift+Tab|Esc|Esc Esc|Ctrl+C|Ctrl+D|Ctrl+R|Ctrl+O|Ctrl+B|Ctrl+T|Ctrl+G|Ctrl+S|Ctrl+V|Ctrl+L|Ctrl+Z|Option+P|Alt+P|Option+T|Alt+T|Option+O|Alt+O|Tab|@|!|#|?|ショートカット|keyboard shortcuts|キーボードショートカット|入力モード|矢印キー","Claude Codeの入力欄でよく使うキー操作と先頭記号。",
"Shift+Tab：パーミッションモード切替 ／ Esc：Claudeを中断・ダイアログを閉じる ／ Esc Esc：入力の消去または巻き戻し(/rewind) ／ Ctrl+C：中断・入力クリア(もう一度で終了) ／ Ctrl+D：終了 ／ Ctrl+R：履歴検索 ／ Ctrl+O：トランスクリプト表示 ／ Ctrl+B：実行中タスクをバックグラウンドへ ／ Ctrl+T：タスクチェックリスト表示 ／ Ctrl+G：エディタで入力を開く ／ Ctrl+S：入力の一時退避 ／ Ctrl+V：画像貼り付け ／ Option/Alt+P：モデル切替 ／ Option/Alt+T：拡張思考 ／ Option/Alt+O：高速モード ／ 行頭の / ：コマンド・スキル ／ 行頭の ! ：シェルモード ／ @：ファイル参照 ／ ? ：ショートカット一覧。改行は Shift+Enter（/terminal-setup で設定）。割り当ては版や端末で異なるので /help も参照。",
`Shift+Tab    # モード切替
Esc          # 中断
Esc Esc      # 巻き戻し
@src/app.ts  # ファイルを指定
!git status  # シェル実行`,"パーミッションモード|/rewind|プランモード|@ファイル参照|/terminal-setup");

T("claude","/terminal-setup","たーみなるせっとあっぷ","/terminal-setup|terminal-setup|Shift+Enter|改行キー設定|shift enter 改行|改行できない|Option as Meta","ターミナルで Shift+Enter による改行などを使えるようにする設定。","VS Code・Cursorなど対応ターミナルにキーバインドを導入する。macOSでは Option キーをMetaとして扱う設定も必要。Vimキーバインドの /vim コマンドはv2.1.92で廃止され、/config の Editor mode で切り替える。","/terminal-setup","ショートカットキー|Vimモード");

T("claude","Vimモード","ぶいあいえむもーど","vim mode|vimモード|vimキーバインド|Editor mode|/vim|NORMAL mode|ノーマルモード|入力欄のVim","入力欄をVimのキー操作（NORMAL/INSERT）で編集できるモード。","/vim コマンドは廃止され、/config → Editor mode で切り替える。Esc でNORMALモード、i/a/o で挿入、h j k l で移動、dd で行削除、ciw等の編集が使える。","/config","/terminal-setup|ショートカットキー|vim");

T("claude","/review","れびゅー","/review|review|/code-review|code-review|コードレビュー|PRレビュー|/security-review|security-review|セキュリティレビュー|/pr-comments|--fix|--comment|--max-findings","現在の差分やPR・ブランチをレビューするコマンド。/review は /code-review の別名。",
"/review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [--max-findings n|all] [PR番号|ブランチ|パス] の形。レベルは指摘の網羅度（低=自信のある少数、高=不確実なものも含め多数）。--comment でPRにインラインコメント、--fix で指摘を作業ツリーに反映。/security-review は現在のブランチ変更のセキュリティ観点レビュー。/pr-comments は v2.1.91 で廃止（Claudeに直接頼む）。より深い多エージェントレビューは /ultrareview。","/review high\n/review 1234 --comment\n/security-review","/ultrareview|Pull Request|レビュー|同梱スキル");

T("claude","/ultrareview","うるとられびゅー","/ultrareview|ultrareview|claude ultrareview|ウルトラレビュー|深いコードレビュー|クラウドレビュー","クラウドのサンドボックスで多エージェントが行う、深いコードレビュー。","/ultrareview [PR または ブランチ] で起動。非対話では claude ultrareview 1234 --json、--post でPRに結果をコメント投稿（既定は --no-post）、--timeout で時間制限（既定45分）。","/ultrareview 1234\nclaude ultrareview 1234 --json","/review|クラウドセッション|Pull Request");

T("claude","/agents","えーじぇんつ","/agents|agents|サブエージェント管理|サブエージェント作成|エージェント管理|/list-agents|list-agents","サブエージェントの管理に関するコマンド（版で挙動が変わった）。","新しい版では「Claudeにサブエージェントを作らせる／.claude/agents/ を直接編集する」という案内を表示（v2.1.197以前は管理UIを開く）。/list-agents は、Claudeがメッセージを送れるサブエージェント・チームメイト・他セッションの一覧。ターミナルの claude agents は別機能（エージェントビュー）。","/agents\n/list-agents","サブエージェント|エージェントビュー|.claude/agents");

T("claude","/usage","ゆーさげ","/usage|usage|/cost|cost|/stats|stats|使用量|使用状況|コスト確認|トークン使用量|使用上限の確認|usage limits|プラン上限","セッションのコスト、プランの使用上限、アクティビティ統計を表示する。（/cost と /stats は別名）","Pro・Max・Team・Enterpriseでは、上限に何が計上されているかの内訳も出る。上限に当たったときは /rate-limit-options、追加クレジットは /usage-credits。応答中でも即時実行される。","/usage\n/cost","レート制限|トークン|/context");

T("claude","/rewind","りわいんど","/rewind|rewind|/checkpoint|checkpoint|チェックポイント|Esc Esc|巻き戻し|/undo|undo|変更を取り消す|rewind code","会話やコードの変更を、過去のチェックポイントまで巻き戻す。別名 /checkpoint, /undo。","各プロンプトの開始時に自動でチェックポイントが作られ、編集前にファイルのスナップショットも取られる。Esc を2回(Esc Esc)でも開ける。会話・コード・両方のどれを戻すか、選択メッセージからの要約もできる。ただしBashコマンドによる変更はGitと別管理なので戻らない。Gitのcommitも併用する。","/rewind","Checkpoints|git reset|git commit");

T("claude","パーミッションモード","ぱーみっしょんもーど","permission mode|permission modes|--permission-mode|default|manual|Manual|acceptEdits|plan|auto|auto mode|dontAsk|bypassPermissions|auto-accept edits|defaultMode|権限モード|自動承認モード|Shift+Tab","Claude Codeが操作をどこまで確認なしで行うかを決めるモード。Shift+Tab で切り替える。",
"default（画面上はManual）：読み取り以外は毎回確認 ／ acceptEdits：ファイル編集と mkdir・mv・cp などは確認なし ／ plan：調べて計画だけ立て、承認までは編集しない ／ auto：別の分類器モデルが操作を審査し、安全なものは確認なしで実行（v2.1.283以降は対話セッションの既定。危険操作・プロンプトインジェクションはブロック） ／ dontAsk：許可ルールにないものは拒否（質問しない） ／ bypassPermissions：確認を全部省略（非常に危険。隔離環境のみ）。起動時は --permission-mode、設定は defaultMode。",
`claude --permission-mode plan
claude --permission-mode acceptEdits
claude --permission-mode auto`,"auto mode|プランモード|--dangerously-skip-permissions|権限|承認モード|permission rule");

T("claude","auto mode","おーともーど","auto mode|オートモード|自動モード|classifier|分類器|/auto-mode-setup|claude auto-mode|autoMode|--permission-mode auto","別の分類器モデルが操作を審査して、人間の確認を減らすパーミッションモード。",
"各操作を分類器がレビューし、問題なければ自動実行、スコープ逸脱・信頼できないインフラ・プロンプトインジェクションの疑いはブロックする。分類器にはツール結果が見えない（悪意ある文面で操縦されにくい）。あなたの ask ルールに一致するものは確認される。設定の確認は claude auto-mode defaults / config、リセットは claude auto-mode reset、/auto-mode-setup で環境の説明を下書き。","claude --permission-mode auto\nclaude auto-mode defaults","パーミッションモード|プロンプトインジェクション|permission rule");

T("claude","permission rule","ぱーみっしょんるーる","permission rules|許可ルール|allow ルール|ask ルール|deny ルール|Bash(git log *)|Read(./.env)|Edit(|WebFetch(domain:|mcp__|ルール構文|permission rule syntax|権限ルール|permissions.allow|permissions.deny|permissions.ask","ツール名と引数パターンで「許可・確認・拒否」を決める設定エントリ。",
"評価順は deny → ask → allow で、最初に一致したものが有効。例：Bash(git log *) は git log 系だけ許可、Read(./.env) の deny で .env の読み取り禁止、mcp__* でMCPツール全体。パーミッションモードより細かい制御で、/permissions や settings.json の permissions で管理する。","{ \"permissions\": { \"allow\": [\"Bash(npm run test *)\"], \"deny\": [\"Read(./.env)\", \"Bash(rm *)\"] } }","権限|settings.json|/permissions|--allowedTools");

T("claude","hooks","ふっくす","hooks|hook|フック|PreToolUse|PostToolUse|PostToolUseFailure|PermissionRequest|PermissionDenied|UserPromptSubmit|UserPromptExpansion|Stop|StopFailure|SubagentStart|SubagentStop|SessionStart|SessionEnd|Notification|PreCompact|PostCompact|InstructionsLoaded|ConfigChange|CwdChanged|FileChanged|WorktreeCreate|WorktreeRemove|TaskCreated|TaskCompleted|TeammateIdle|Elicitation|matcher|Claude Code hooks|フック設定|hook event","Claude Codeのライフサイクルの決まった時点で、自動的にコマンド等を実行する仕組み。",
"「AIに頼む」のではなく「必ず実行される」ルールにしたいときに使う。主なイベント：SessionStart / SessionEnd、UserPromptSubmit（入力時）、PreToolUse（ツール実行前：ブロック可）、PermissionRequest / PermissionDenied、PostToolUse / PostToolUseFailure（実行後：整形・lint）、Notification、SubagentStart / SubagentStop、TaskCreated / TaskCompleted、Stop / StopFailure（応答完了・API失敗）、PreCompact / PostCompact、InstructionsLoaded、ConfigChange、CwdChanged、FileChanged、WorktreeCreate / WorktreeRemove、Elicitation など約30種。ハンドラ種別は command（シェル）／http（POST）／mcp_tool／prompt（LLM判定）／agent（サブエージェント検証）。構成は「イベント＋matcher＋ハンドラ」。settings.json に記述、/hooks で確認。",
`{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx prettier --write ." }]
    }]
  }
}`,"settings.json|ガードレール|git hook|/hooks|matcher");

T("claude","サブエージェント","さぶえーじぇんと","subagent|sub-agent|subagents|Task tool|Agent tool|.claude/agents|サブエージェント|専門エージェント|カスタムエージェント|custom agent|Explore|Plan agent|general-purpose|--agent|--agents|isolation: worktree|forked subagent|フォーク","特定の役割に特化した別のエージェント。メインとは別のコンテキストウィンドウ・権限で動く。",
"例：調査専門、コードレビュー専門、テスト作成専門。長い調査を任せると、メインの会話が汚れない。.claude/agents/名前.md の frontmatter（description・tools など）と本文の指示で定義する。組み込みは Explore・Plan・general-purpose。claude --agent 名前 でそのエージェントとして起動、--agents でJSON定義、/subtask で現在の会話を引き継いだ“フォーク”サブエージェントを背景で実行。isolation: worktree で別のgit worktreeに隔離できる。サブエージェントは所属セッション内に留まり、別セッション間は cross-session messaging を使う。",
`# .claude/agents/reviewer.md
---
name: reviewer
description: コード変更をレビューする専門家
tools: Read, Grep, Glob
---
あなたは厳格なコードレビュアーです。...`,"マルチエージェント|/agents|Agent teams|worktree isolation|frontmatter|Skills");

T("claude","claude -p","くろーどぴー","claude -p|-p|--print|print mode|headless|headless mode|ヘッドレス|ヘッドレスモード|非対話モード|非対話|non-interactive|--output-format|--output-format json|stream-json|--max-turns|スクリプトから呼ぶ|パイプ|pipe|claude -p \"","非対話モード（旧称ヘッドレス）。1回の指示を実行して結果を出力して終了する。スクリプトやCI向け。",
"-p（--print）で対話UIなしに実行。パイプでdiffやログを渡せる。--output-format text/json/stream-json、--max-turns（往復回数の上限）、--max-budget-usd（費用上限）、--json-schema（スキーマ検証済みJSON出力）、--permission-prompts none（確認に答える人がいない環境で拒否）、--no-session-persistence（履歴を保存しない）、--bare（設定の自動読み込みなしで高速起動）が主なオプション。Agent SDK（Python/TypeScript）が同等のプログラム向け実装。",
`claude -p "このdiffをレビューして" < change.diff
git diff | claude -p "変更点を要約して"
claude -p "テストを直して" --max-turns 10 --max-budget-usd 2 --output-format json`,"Claude Code|GitHub Actions|--bare|--allowedTools|Agent SDK");

T("claude","CLIオプション","しーえるあいおぷしょん","--model|--verbose|--debug|--debug-file|--add-dir|--allowedTools|--disallowedTools|--tools|--append-system-prompt|--system-prompt|--append-system-prompt-file|--system-prompt-file|--mcp-config|--strict-mcp-config|--settings|--setting-sources|--version|-v|--help|-h|--continue|-c|--resume|-r|--permission-mode|--output-format|--input-format|--max-turns|--session-id|--fork-session|--ide|--chrome|--worktree|-w|--tmux|--teleport|--cloud|--remote|--plugin-dir|--effort|--name|-n|--init|claude --help|フラグ|オプション一覧|フラグ一覧","claude コマンドに付けられる主なオプション（フラグ）の一覧。",
"--model：モデル指定 ／ -p：非対話実行 ／ -c：直近の会話を再開 ／ -r：会話を選択・名前で再開 ／ -n,--name：セッション名 ／ --fork-session：再開時に新しいセッションIDで分岐 ／ --permission-mode：権限モード ／ --allowedTools / --disallowedTools：許可・拒否ルール ／ --tools：使える組み込みツールを制限 ／ --add-dir：作業フォルダ追加 ／ --append-system-prompt(-file) / --system-prompt(-file)：システムプロンプトの追加・置換 ／ --mcp-config / --strict-mcp-config：MCP設定 ／ --settings：設定JSON ／ -w,--worktree：隔離worktreeで開始 ／ --effort：思考の深さ ／ --chrome：Chrome連携 ／ --plugin-dir：プラグイン読込 ／ --cloud：クラウドセッション作成 ／ --teleport：クラウド→手元へ ／ --verbose,--debug：詳細ログ ／ --dangerously-skip-permissions：確認すべて省略(危険)。※ claude --help に載らないフラグもあり、版で増減する。",
`claude --help
claude --model opus
claude -c
claude -n my-feature
claude -w feature-auth
claude -p "要約して" --output-format json`,"claude -p|パーミッションモード|--allowedTools|--worktree|--bare");

T("claude","--bare","べあもーど","--bare|bare mode|ベアモード|CLAUDE_CODE_SIMPLE|最小モード|minimal mode","フック・スキル・MCP・CLAUDE.md・メモリなどの自動読み込みを省略して高速・再現的に起動するモード。","スクリプトやCIで、どのマシンでも同じ結果にしたいときに推奨。Bash・ファイル読み書きは使える。--add-dir で渡したフォルダのスキルは読み込む。例：claude --bare -p \"query\"","claude --bare -p \"このPRを要約して\"","claude -p|--safe-mode|CI");

T("claude","--safe-mode","せーふもーど","--safe-mode|safe mode|セーフモード|CLAUDE_CODE_SAFE_MODE|設定を全部無効で起動|トラブルシュート 起動","CLAUDE.md・スキル・プラグイン・フック・MCPなどカスタマイズをすべて無効にして起動するトラブルシューティング用モード。","認証・モデル選択・組み込みツール・権限は通常どおり。設定が原因で壊れていないかの切り分けに使う（--bareとは別物）。","claude --safe-mode","--bare|/doctor|claude doctor");

T("claude","--worktree","わーくつりー","--worktree|-w|claude -w|git worktree claude|worktree isolation|.claude/worktrees|--tmux|ワークツリー隔離|isolation: worktree|WorktreeCreate|WorktreeRemove","隔離したgit worktree（<repo>/.claude/worktrees/名前）でClaudeを起動するオプション。","並列に走らせるセッションが互いのファイルを壊さない。#123 やPRのURLを渡すと、そのPR/MRをoriginから取得してworktreeを作る。--tmux でtmuxセッション付き。サブエージェントは isolation: worktree で同様に隔離できる。","claude -w feature-auth\nclaude -w #123","git worktree|サブエージェント");

T("claude","--tools","つーるず","--tools|--allowed-tools|--disallowedTools|ツール制限|使えるツールを絞る|--tools \"\"|--tools default","使える組み込みツールそのものを制限するオプション（許可プロンプトの省略とは別）。","--tools \"Bash,Edit,Read\" のように指定。\"\" で全無効、default で既定セット。MCPツールには効かないので --disallowedTools \"mcp__*\" を併用。許可ルールで承認を省略するのは --allowedTools。","claude --tools \"Bash,Edit,Read\"","--allowedTools|ツール(Claude Code)");

T("claude","--max-budget-usd","まっくすばじぇっと","--max-budget-usd|max budget|予算上限|費用上限|コスト上限|--max-turns|上限金額","非対話実行で使うAPI費用の上限（ドル）を決めるオプション。","上限に達すると停止し、サブエージェントの起動も失敗する。クライアント側の推定値なので請求額とは差が出る。往復回数の上限は --max-turns。","claude -p --max-budget-usd 5.00 \"query\"","claude -p|レート制限");

T("claude","--fallback-model","ふぉーるばっくもでる","--fallback-model|fallbackModel|フォールバックモデル|自動フォールバック|モデルが過負荷|model fallback","主モデルが過負荷や利用不可のとき、自動で別モデルに切り替える設定。","カンマ区切りで順番に試す。claude --fallback-model sonnet,haiku。永続化は fallbackModel 設定。","claude --fallback-model sonnet,haiku","/model|Claude");

T("claude","--json-schema","じぇいそんすきーま","--json-schema|JSON Schema|構造化出力 claude|validated JSON|スキーマ検証","指定したJSON Schemaに合う検証済みJSONを出力させるオプション（非対話モード専用）。","スクリプトでClaudeの結果を確実に機械処理したいときに使う。","claude -p --json-schema '{\"type\":\"object\"}' \"query\"","claude -p|構造化出力");

T("claude","--name","ねーむ","--name|-n|セッション名|/rename|session name|名前をつけて再開|claude --resume <name>","セッションに表示名を付けるオプション。/resumeや端末タイトルに出て、名前で再開できる。","claude -n \"my-feature\" で付け、claude --resume my-feature で再開。実行中は /rename で変更（名前省略で自動生成）。","claude -n my-feature-work\nclaude --resume my-feature-work","セッション|/resume");

T("claude","--fork-session","ふぉーくせっしょん","--fork-session|fork session|セッション分岐|/fork|/branch|会話を分岐|ブランチ会話","再開時に元と別のセッションIDで分岐させるオプション（/fork・/branch もある）。","元の会話を壊さずに別の方向を試せる。/branch は会話をその時点で分岐、/fork は現在の会話を背景セッションにコピーして手元で作業を続ける。","claude --resume abc123 --fork-session","セッション|/resume");

T("claude","--from-pr","ふろむぴーあーる","--from-pr|from pr|PRに紐づくセッション|PRからセッション再開","特定のPull Requestに紐づいたセッションを絞り込んで再開するオプション。","PR番号、GitHub/GitHub EnterpriseのPR URL、GitLabのMR、BitbucketのPRのURLを受け取る。ClaudeがPRを作ると自動で紐づく。","claude --from-pr 123","セッション|Pull Request");

T("claude","/plan","ぷらん","/plan|plan|/plan 説明|プランモードに入る|enter plan mode","プロンプトから直接プランモードに入るコマンド。","説明を添えると、そのタスクの計画立案をすぐ開始する。例：/plan ログイン機能を設計して。Shift+Tabでも切り替え可能。","/plan 認証まわりのリファクタ計画を立てて","プランモード|パーミッションモード");

T("claude","/goal","ごーる","/goal|goal|goal clear|ゴール|条件を満たすまで続ける|keep Claude working toward a goal|目標を設定","条件を満たすまで、Claudeがターンをまたいで作業を続けるよう目標を設定するコマンド。","/goal テストがすべて通る のように条件を渡すと、その達成まで（または別の理由で解除されるまで）自律的に進む。引数なしで現在の目標、clear/stop/off/cancel で解除。成否を判定できる検証手段（テスト・ビルド等）が前提。","/goal 全テストが通ってlintエラーがゼロ","verification loop|エージェントループ|/loop");

T("claude","verification loop","べりふぃけーしょんるーぷ","verification loop|検証ループ|検証手段|テストで確認|Claudeが自分で確認|give Claude a way to verify","「本当に終わったか」を、Claude自身が実行して確かめられる仕組み（テスト・ビルド・スクショ比較など）。","検証手段があれば、成功するまで反復できる。/goal・無人実行・動的ワークフローの前提。「完了」の判断をAI任せにしない。指示するときは「テストを実行して通るまで直して」と書くのが基本。","","/goal|テスト|エージェントループ");

T("claude","/loop","るーぷ","/loop|loop|繰り返し実行|定期実行|ループコマンド|定期チェック|self-pace|Run prompts on a schedule","指示を一定間隔で（または自分のペースで）繰り返し実行する同梱スキル。","/loop 5m ... のように間隔を指定。省略するとClaudeが自分で間隔を決める。セッションを開いたままにしておく必要がある。クラウドで動かしたい定期処理は routines（/schedule）。","/loop 5m デプロイの状況を確認して","/schedule|routines|同梱スキル");

T("claude","/schedule","すけじゅーる","/schedule|schedule|routines|routine|ルーティン|ルーチン|クラウドで定期実行|Automate work with routines|定期タスク","クラウド上で動く「ルーティン」（定期・イベント起動の自動作業）を作成・実行するコマンド。","対話しながら設定でき、PCを閉じていても実行される。ローカルで開いたままの繰り返しは /loop。","/schedule 毎朝9時にIssueを要約して","/loop|クラウドセッション|cron");

T("claude","/background","ばっくぐらうんど","/background|/bg|--bg|--background|claude --bg|background agent|バックグラウンドエージェント|バックグラウンドセッション|background session|detach|デタッチ","今のセッションを背景エージェントとして切り離し、ターミナルを空けるコマンド。","claude --bg \"依頼\" で最初から背景で開始。claude agents（エージェントビュー）で一覧・指示、claude attach <id> で再接続、claude logs <id> でログ、claude stop / respawn / rm で停止・再起動・削除。","/background\nclaude --bg \"flaky testを調査して\"\nclaude agents","エージェントビュー|claude attach|サブエージェント");

T("claude","エージェントビュー","えーじぇんとびゅー","agent view|claude agents|claude agents --json|claude attach|claude logs|claude stop|claude kill|claude respawn|claude rm|claude daemon|supervisor|並列セッション管理","複数のバックグラウンドセッションを一覧・監視・指示できる画面（claude agents）。",
"claude agents で開く（--json でスクリプト用出力、--cwd で絞り込み）。管理コマンド：claude attach <id|名前>（接続）、claude logs（出力表示）、claude stop（停止）、claude respawn（会話を保ったまま再起動）、claude rm（一覧から削除）、claude daemon status/stop（背景を支える監視プロセスの状態確認・停止）。","claude agents\nclaude attach 7c5dcf5d\nclaude logs 7c5dcf5d","/background|サブエージェント");

T("claude","Agent teams","えーじぇんとちーむ","agent teams|エージェントチーム|teammate|チームメイト|team lead|--teammate-mode|teammateMode|TeammateIdle|実験機能","チームリードが複数の独立したClaude Codeセッション（チームメイト）を共有タスクリストで調整する実験的機能。","サブエージェントと違い、各チームメイトが自分のコンテキストを持ち、直接やり取りもできる。既定は無効。表示は --teammate-mode（in-process / auto / tmux / iterm2）。","claude --teammate-mode tmux","サブエージェント|マルチエージェント|オーケストレーター");

T("claude","クラウドセッション","くらうどせっしょん","cloud session|Cloud session|クラウドセッション|Claude Code on the web|Claude Code Web|claude.ai/code|リモートセッション|remote session|--cloud|--remote|--teleport|/teleport|/web-setup|/remote-env|self-hosted environment|Web版 Claude Code|クラウド実行|ccpool_","自分のPCではなくクラウド上で動くClaude Codeセッション。PCを閉じても作業が続く。",
"claude.ai/code、モバイルアプリ、Desktop（Cloud選択）、claude --cloud \"依頼\"、ルーティンから開始できる。リポジトリはクラウドの隔離コンテナにcloneされ、ブランチにpushされる（コンテナは一時的なので成果は必ずcommit/pushして残す）。クラウド→手元は /teleport（claude --teleport）、手元→クラウドは --cloud（--remote は旧名）。/web-setup でGitHub認証、/remote-env で既定環境を選択。組織が運用する“セルフホスト環境”（claude self-hosted-runner）も選べる。「Claude Code on the web」は現在、claude.ai/code のブラウザ画面だけを指す名称。","claude --cloud \"ログインのバグを直して\"\nclaude --teleport","Remote Control|teleport|サンドボックス|git push|環境変数");

T("claude","Remote Control","りもーとこんとろーる","remote control|/remote-control|claude remote-control|--remote-control|--rc|リモートコントロール|スマホから操作|手元のセッションを遠隔操作","手元で動いているClaude Codeセッションを、スマホやブラウザ（claude.ai）から続けて操作できる機能。","コードの実行やファイルは自分のPCに残り、操作画面だけがリモートになる。クラウドで実行する「クラウドセッション」とは別物。claude remote-control で専用サーバーモードを起動。","claude --remote-control \"My Project\"\n/remote-control","クラウドセッション|teleport");

T("claude","teleport","てれぽーと","teleport|/teleport|--teleport|テレポート|クラウドセッションを手元に|cloud to terminal","クラウドセッションを手元のターミナルに引き寄せるコマンド（/teleport、claude --teleport）。","Claudeがブランチと会話履歴を取得し、クラウド側の最後の状態から再開する。逆方向（手元→クラウド）は --cloud。","/teleport","クラウドセッション|Remote Control");

T("claude","Plugin マーケットプレイス","ぷらぐいんまーけっとぷれいす","claude plugin|claude plugins|plugin install|plugin marketplace|marketplace|マーケットプレイス|/plugin marketplace add|code-review@claude-plugins-official|--plugin-dir|--plugin-url|/reload-plugins|plugin manifest|plugin.json","プラグイン（スキル・フック・サブエージェント・MCPの詰め合わせ）の配布元と、導入コマンド。",
"claude plugin install 名前@マーケットプレイス、/plugin（メニュー）、--plugin-dir（そのセッションだけ読込）。プラグインのスキルは plugin名:skill名 で名前空間が分かれる。変更を反映するのは /reload-plugins。信頼できる提供元のものだけ入れる（フックやMCPが実行されるため）。","claude plugin install code-review@claude-plugins-official\n/reload-plugins","/plugin|Skills|hooks|サブエージェント");

T("claude","auto memory","おーともめもりー","auto memory|自動メモリ|MEMORY.md|~/.claude/projects|Claudeが自分で書くメモ|メモリ自動","あなたの修正や好みをもとに、Claudeが自分で書き溜める覚え書き。","リポジトリごとに ~/.claude/projects/ 以下に保存され、同じリポジトリのworktreeは共有。MEMORY.md の最初の200行/25KBが毎回読み込まれる。人が書くのが CLAUDE.md、Claudeが書くのが auto memory。/memory で確認・オフ切替。","/memory","CLAUDE.md|/memory|メモリ");

T("claude",".claude/rules","るーるず","rules|.claude/rules|ルールファイル|paths:|パススコープ|path-scoped rules|path scoped","CLAUDE.mdと一緒に読み込まれる、分割した指示ファイル群（.claude/rules/*.md）。","frontmatter の paths: で対象ファイルを限定でき、一致するファイルを読み書きしたときだけ読み込まれるため、コンテキストを節約できる。","","CLAUDE.md|frontmatter|コンテキスト");

T("claude","frontmatter","ふろんとまった","frontmatter|フロントマター|YAML frontmatter|---|SKILL.md frontmatter|description:|tools:|name:|ファイル先頭のYAML","Markdownファイルの先頭にある、---で囲んだYAML設定ブロック。","スキル・サブエージェント・出力スタイル・ルールが設定（description や tools など）をここに書き、閉じ---以降を本文の指示として扱う。最初の行が --- である必要がある。","---\nname: my-skill\ndescription: いつ使うか\n---\n手順…","Skills|サブエージェント|.claude/rules");

T("claude",".claude ディレクトリ","どっとくろーどでぃれくとり","~/.claude|.claude directory|.claude folder|.claude/|.claude/settings.json|.claude/skills|.claude/agents|.claude/commands|.claude/rules|~/.claude.json|claude purge|設定フォルダ","Claude Codeがプロジェクト用設定（設定・フック・スキル・サブエージェント・ルール・メモリ）を読む場所。","プロジェクト直下の .claude/ と、ユーザー共通の ~/.claude/ がある。会話の記録(transcript)は ~/.claude/projects/ 以下。プロジェクトのローカルデータを消すのが claude purge（--dry-runで確認）。","claude purge ~/work/repo --dry-run","settings.json|CLAUDE.md|transcript");

T("claude","settings layers","せってぃんぐれいやーず","settings layers|設定の優先順位|settings precedence|managed settings|managed policy|server-managed settings|組織の管理設定|settings.local.json|設定階層","設定を読む階層。優先度は 管理ポリシー > コマンドライン引数 > ローカル(.claude/settings.local.json) > プロジェクト(.claude/settings.json) > ユーザー(~/.claude/settings.json)。","配列は階層をまたいで結合、単一値は上位が優先。組織管理(managed settings)は管理コンソールや端末のOSパスから配布され、ユーザー・プロジェクト設定では上書きできない。","","settings.json|CLAUDE.md");

T("claude","project trust","ぷろじぇくとらすと","project trust|workspace trust|信頼するか|Do you trust this folder|フォルダを信頼|trust dialog|信頼ダイアログ","リポジトリの設定を読み込む前に出る「このフォルダを信頼しますか」の確認。","信頼するまで、リポジトリが持ち込むプロジェクトの許可ルールやマーケットプレイスなどは保留される。他人のリポジトリを開くときは中身（フックやMCP設定）を確認してから信頼する。","","権限|プロンプトインジェクション|hooks");

T("claude","agentic harness","えーじぇんてぃっくはーねす","agentic harness|harness|ハーネス|エージェントハーネス|agent harness|scaffold|スキャフォールド","LLMを実用的なコーディングエージェントにする、ツール・コンテキスト管理・実行環境の一式。","Claude Codeがハーネス、Claudeがその中のモデル。ハーネスがファイルアクセス、シェル実行、権限制御、メモリ読込、行動を連ねるループを担う。同じモデルでもハーネスが違えば性能も安全性も変わる。","","AIエージェント|エージェントループ|ツール呼び出し");

T("claude","system reminder","しすてむりまいんだー","system reminder|system-reminder|<system-reminder>|システムリマインダー|ハーネスが挿入するメッセージ|additionalContext","ハーネス（Claude Code）が会話に差し込む、Claude向けの補足メッセージ。","CLAUDE.md、出力スタイル、フックが返すadditionalContext、スキル一覧、ファイル変更通知、コミット/PRの署名行などはシステムプロンプトではなくsystem reminderとして渡される。ユーザーが送るものではない。","","システムプロンプト|CLAUDE.md|hooks");

T("claude","turn","たーん","turn|ターン|1ターン|max turns|--max-turns|1往復","ユーザーの入力から、Claudeが（ツール呼び出しを挟みつつ）応答し終えるまでの1区切り。","Stopフックは各ターンの終わりに発火する。--max-turns は非対話実行での最大ターン数。1つのセッションは多数のターンで構成される。","","エージェントループ|セッション|--max-turns");

T("claude","transcript","とらんすくりぷと","transcript|トランスクリプト|会話記録|session transcript|.jsonl|~/.claude/projects|Ctrl+O|transcript viewer|会話ログ","セッションの保存記録（既定は ~/.claude/projects/<project>/<session-id>.jsonl）。","再開(resume)はこのファイルを読み戻して行う。画面上のトランスクリプトビューアは Ctrl+O。ログに秘密情報が残りうるので扱いに注意。","","セッション|/resume|.claude ディレクトリ");

T("claude","/tasks","たすくす","/tasks|tasks|/bashes|bashes|バックグラウンドタスク一覧|background tasks|Ctrl+T|task checklist","現在のセッションのバックグラウンド作業（終了済みサブエージェント含む）を表示・管理する。別名 /bashes。","Ctrl+B で実行中コマンドを背景へ、Ctrl+T でClaudeのタスクチェックリストの表示を切り替える。","/tasks","バックグラウンド実行|サブエージェント|/todos");

T("claude","/btw","ばいざうぇい","/btw|btw|side question|サイドクエスチョン|ちょっとした質問|会話に残さず質問","会話の履歴に残さずに、横道の質問をするコマンド。","作業中の文脈を汚さずに「これって何？」と聞ける。","/btw このオプションの意味は？","コンテキスト|/context");

T("claude","/diff","でぃふ","/diff|diff|変更を確認|working tree diff|差分レビュー","作業ツリーの変更（Claudeが加えた編集を含む）を確認するコマンド。","commit前に、何が変わったかを目視確認する習慣づけに。","/diff","git diff|レビュー");

T("claude","/cd","しーでぃー","/cd|cd|作業ディレクトリ移動|working directory 変更|ディレクトリを変える|/add-dir","会話を保ったまま、セッションの作業ディレクトリを移動するコマンド。","別フォルダのファイルも見たいだけなら /add-dir（作業対象に追加）。","/cd ../other-repo","/add-dir|cd");

T("claude","/copy","こぴー","/copy|copy|最後の返答をコピー|応答をクリップボードに","Claudeの直前の返答をクリップボードにコピーする（/copy 2 で2つ前）。","","/copy\n/copy 2","");

T("claude","/exit","えぐじっと","/exit|/quit|quit|exit|終了|Claude Codeを終了","Claude Codeを終了する（別名 /quit）。","接続中のバックグラウンドセッションでは、切り離すだけでセッションは動き続ける。Ctrl+D 2回でも終了。","/exit","ショートカットキー|/background");

T("claude","/skills","すきるず","/skills|skills list|スキル一覧|/reload-skills|/skill-doctor|skill-doctor|スキルを再読み込み","使えるスキルの一覧（/skills）、ディスクの変更の再読込（/reload-skills）、コスト確認（/skill-doctor）。","/skills では t でトークン数順に並べ替え、スキルのオン/オフを切り替えられる。/skill-doctor は各スキルのコンテキスト負担と使用頻度を示し、不要なスキルを見つけられる。","/skills\n/reload-skills\n/skill-doctor","Skills|同梱スキル|コンテキスト");

T("claude","/import","いんぽーと","/import|import|claude import|他のエージェントから設定を移行|import codex|import gemini|import cursor","Codex・Gemini CLI・Cursorの設定（指示ファイル・MCP・コマンド・サブエージェント・スキル）をClaude Codeに取り込む。","--dry-run で書き込まずにプレビュー、--yes で確認を省略。claude import codex --dry-run のようにシェルからも起動できる。","/import codex --dry-run","AGENTS.md|CLAUDE.md|Codex");

T("claude","/sandbox","さんどぼっくす","/sandbox|sandbox|sandboxing|サンドボックスモード|Bashサンドボックス|OS-level isolation","Bashツールを、OSレベルのファイル・ネットワーク隔離の中で動かすサンドボックスのオン/オフ。","境界内なら都度の承認なしで自由に作業できる。権限ルールとは別レイヤーの防御。対応環境のみ。","/sandbox","サンドボックス|権限|permission rule");

T("claude","/chrome","くろーむ","/chrome|chrome|--chrome|--no-chrome|/claude-in-chrome|Claude in Chrome|Chrome連携|ブラウザ自動操作 Claude","Chromeブラウザ連携（Claude in Chrome）。Webページの確認・操作・テストをClaudeに任せる。","claude --chrome で有効化、--no-chrome で無効化。/claude-in-chrome [依頼] は、ブラウザでの作業（ページのテスト、フォーム入力など）を頼む同梱スキル。","claude --chrome","Playwright|MCP|同梱スキル");

T("claude","/advisor","あどばいざー","/advisor|advisor|--advisor|advisor tool|アドバイザーツール|advisorModel","より高性能なモデルに難しい判断だけ相談させる「アドバイザーツール」の設定。","/advisor [model|off]、起動時は --advisor opus など。普段は軽量モデルで走らせ、重要な判断だけ上位モデルに任せるとコストを抑えられる。","/advisor opus","/model|effort level");

T("claude","/theme","てーま","/theme|theme|/color|color|/tui|tui|fullscreen|/focus|focus view|フルスクリーン描画|テーマ変更|プロンプトバーの色","見た目の設定：/theme（配色）、/color（プロンプトバーの色）、/tui（描画方式。fullscreenはちらつきのない全画面）、/focus（最後の入力と結果だけ表示）。","","/theme\n/tui fullscreen\n/color blue","/config|/statusline");

T("claude","/voice","ぼいす","/voice|voice|voice dictation|音声入力|ディクテーション|hold|tap","音声入力（ディクテーション）の切り替え。hold（押している間）/tap（押して開始・停止）/off。","claude.aiアカウントが必要。","/voice tap","/config");

T("claude","/recap","りきゃっぷ","/recap|recap|session recap|セッションの要約|1行サマリー","現在のセッションを1行で要約する。","長時間作業から戻ったとき、どこまで進んだか思い出すのに便利。","/recap","/compact|セッション");

T("claude","/keybindings","きーばいんでぃんぐす","/keybindings|keybindings|keybindings.json|キーバインド設定|ショートカットを変更|customize keyboard shortcuts","キーボードショートカットの設定ファイル（keybindings.json）を開く。","コードで言えば ~/.claude/keybindings.json。コード補完や送信キーなど割り当てを変更できる。","/keybindings","ショートカットキー");

T("claude","/install-slack-app","いんすとーるすらっくあっぷ","/install-slack-app|Slack連携|Claude in Slack|Claude Tag|@Claude Slack|Slackからclaude","Claude Slackアプリをインストールする（ブラウザでOAuthを完了）。","Slack上でClaudeにタスクを依頼し、Claude Codeセッションを起動できる連携。","/install-slack-app","Slack|GitHub App");

T("claude","/autofix-pr","おーとふぃっくすぴーあーる","/autofix-pr|autofix|自動修正|PRを見守って修正|CI失敗を自動修正|Auto-fix pull requests","現在のブランチのPRを監視し、CIが落ちたら自動で修正をpushするクラウドセッションを起動する。","Claude Code on the webの機能。CI失敗への対応をAIに任せる運用。pushされた修正は人間がレビューする。","/autofix-pr","クラウドセッション|CI|Pull Request");

T("claude","/batch","ばっち","/batch|batch|大規模変更を並列|parallel refactor|codebase-wide change","コードベース全体の大規模変更を、調査→分割→並列実行で進める同梱スキル。","","/batch すべてのclassコンポーネントをhooks化して","同梱スキル|サブエージェント|git worktree");

T("claude","/debug","でばっぐ","/debug|debug|デバッグログ|session debug log|debug logging","セッションのデバッグログを有効にし、ログを読んで問題を調査する同梱スキル。","起動時の --debug / --debug-file でもログを出せる（--debug='mcp,startup' のようにカテゴリ指定）。","/debug 起動が遅い","同梱スキル|ログ|--verbose");

T("claude","dynamic workflows","だいなみっくわーくふろー","workflows|/workflows|dynamic workflows|動的ワークフロー|/deep-research|deep-research|/workflow-authoring|ultracode|ワークフロー(Claude Code)","大量のサブエージェントをスクリプトで組織して走らせる仕組み（/workflows で進捗確認・一時停止・保存）。","/deep-research は、Web検索を並列に広げて出典を突き合わせ、レポートを合成する同梱ワークフロー。ultracode は xhigh 相当の思考でワークフローをClaudeに任せるモード。","/workflows","サブエージェント|verification loop|/goal");

T("claude","Claude Code artifact","くろーどこーどあーてぃふぁくと","Claude artifact|artifact|アーティファクト|Artifacts|/artifacts|claude.ai artifact|公開ページ|Share session output","セッションから claude.ai の非公開URLに公開できる、動くWebページ（レポート・ダッシュボード・図など）。","ターミナルの文字より見やすい成果物を共有できる。同じページは更新（再公開）すると同じURLで置き換わる。共有範囲はプランによる。/artifacts で一覧。","/artifacts","クラウドセッション|Markdown");

T("claude","channel","ちゃんねる","channel|channels|--channels|Telegram|Discord|iMessage|push events|イベントを流し込む|--dangerously-load-development-channels","実行中のセッションに外部イベントを送り込むMCPサーバー（Telegram・Discord・iMessageなど）。","離席中に起きたことにClaudeが反応でき、双方向で返信も可能。リサーチプレビュー機能。","claude --channels plugin:my-notifier@my-marketplace","MCP|Webhook");

T("claude","MCP Tool Search","えむしーぴーつーるさーち","tool search|MCP tool search|ツール検索|deferred tools|ツールスキーマの遅延読み込み","MCPツールの詳細スキーマを必要になるまで読み込まず、コンテキストを節約する仕組み。","起動時はツール名とサーバー指示だけ読み込み、使うときに詳細を取得する。使っていないMCPサーバーが文脈を圧迫しにくくなる。","","MCP|コンテキスト");

T("claude","prompt suggestions","ぷろんぷとさじぇすちょん","prompt suggestions|--prompt-suggestions|次のプロンプト候補|サジェスト|入力候補","各ターンの後に表示される「次に打ちそうな指示」の候補。","Tabで採用できる。非対話のstream-jsonでも --prompt-suggestions で出力できる。","","ショートカットキー|claude -p");
