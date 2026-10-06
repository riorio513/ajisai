/* ===== Claude Code ===== */
T("claude","Claude Code","くろーどこーど","claude code|claude|claudeコマンド|クロードコード|Claude Code CLI|claude-code|@anthropic-ai/claude-code|claude.ai/code","Anthropicが提供する、ターミナル等で動くAIコーディングエージェント。",
"プロジェクトのフォルダで claude と打って起動し、日本語で「このバグを直して」「テストを書いて」と頼むと、ファイルを読み・編集し・コマンドを実行して作業する。ターミナル(CLI)のほか、VS Code/JetBrains拡張、デスクトップアプリ、Web版(claude.ai/code)、GitHub Actions連携などで使える。操作の許可は都度確認でき、設定で自動化もできる。",
`cd my-project
claude                      # 対話モードで起動
claude "READMEを要約して"     # 最初の指示つきで起動
claude -p "テストを実行して結果を要約"   # 1回だけ実行して終了`,"CLAUDE.md|スラッシュコマンド|パーミッションモード|サブエージェント|hooks|MCP");

T("claude","claude(インストール)","くろーどいんすとーる","install claude code|npm install -g @anthropic-ai/claude-code|claude update|claude --version|claude doctor|claude install|インストール|アップデート|native installer|claude migrate-installer","Claude Codeのインストールと更新。",
"公式のインストーラ（macOS/Linux/WSLはcurlスクリプト、Windowsは専用スクリプトやWinGet等）か、Node.js環境ならnpmで入れる。入れた後は claude を起動して、ブラウザでログインする。インストール方法は更新されるので公式ドキュメントも確認。",
`npm install -g @anthropic-ai/claude-code
claude --version
claude update       # 更新
claude doctor       # 環境診断`,"Claude Code|npm|/doctor");

T("claude","CLAUDE.md","くろーどえむでぃー","CLAUDE.md|claude.md|CLAUDE.local.md|プロジェクトメモリ|project memory|メモリファイル|~/.claude/CLAUDE.md|クロードエムディー","Claude Codeが起動時に必ず読み込む、プロジェクト専用の指示書（Markdown）。",
"リポジトリのルートに置き、プロジェクトの概要、よく使うコマンド（ビルド・テスト）、コーディング規約、やってはいけないことなどを書く。毎回説明する手間が省け、エージェントの精度が安定する。置き場所は、全プロジェクト共通(~/.claude/CLAUDE.md)・プロジェクト共有(./CLAUDE.md)・個人用(CLAUDE.local.md)など。/init で雛形を自動生成できる。",
`# CLAUDE.md の例
## コマンド
- テスト: npm test
- ビルド: npm run build
## ルール
- 回答は日本語
- mainへ直接pushしない
- .env は読まない・出力しない`,"/init|AGENTS.md|メモリ|コンテキストエンジニアリング");

T("claude","スラッシュコマンド","すらっしゅこまんど","slash command|slash commands|/コマンド|スラッシュ|/ コマンド|スラッシュコマンド一覧|/help|カスタムスラッシュコマンド|custom slash command|.claude/commands","Claude Codeの対話中に「/」で始めて実行する、操作用コマンド。",
"/help で一覧、/clear で会話リセット、/compact で要約、/model でモデル切替、/permissions で許可設定…のように使う。自作も可能で、.claude/commands/名前.md にプロンプトを書けば /名前 で呼び出せる（スキルと統合・拡張されている）。",
`/help
/clear
/compact
/model
/permissions`,"Claude Code|Skills|/help|/clear|/compact");

T("claude","/help","へるぷ","/help|help|ヘルプ|使い方","使えるコマンドとショートカットのヘルプを表示する。","","/help","スラッシュコマンド");
T("claude","/clear","くりあ","/clear|clear|会話をリセット|履歴クリア|/reset|/new","会話履歴（コンテキスト）を空にして新しく始める。","別タスクに移る前に実行すると、前の話題が混ざらず精度とコストの面で有利。","/clear","/compact|コンテキスト");
T("claude","/compact","こんぱくと","/compact|compact|/compact 指示|会話の圧縮|要約して続行","会話を要約して圧縮し、コンテキストを空ける。","指示を添えると、残す内容を指定できる。","/compact\n/compact テスト結果と決定事項を残して","compact|コンテキスト");
T("claude","/init","いにっと","/init|init|CLAUDE.mdを作る|CLAUDE.md 生成","コードベースを調べて、CLAUDE.md の雛形を自動生成する。","最初に1回実行し、生成物を手で整えるのが定番。","/init","CLAUDE.md");
T("claude","/model","もでる","/model|model|モデル切り替え|モデル変更|--model|-m|/model opus|/model sonnet|/model haiku|opusplan","使用するモデルを切り替える。","起動時は claude --model <名前> でも指定できる。難しい設計は高性能モデル、単純作業は軽量モデル、と使い分けるとコストと速度が改善する。「opusplan」のように、計画は高性能・実行は軽量という自動切替の設定もある。","/model\nclaude --model sonnet","Claude|/status");
T("claude","/permissions","ぱーみっしょんず","/permissions|permissions|許可ルール|allow ルール|permission rules|権限設定|/allowed-tools","ツールの許可・確認・拒否ルールを表示・編集する。","「git status は毎回確認なしで許可」「rm は拒否」など、ルールを細かく管理できる。settings.json の permissions と同じもの。","/permissions","権限|settings.json|パーミッションモード");
T("claude","/config","こんふぃぐ","/config|config|設定画面|claude config|設定を開く|/settings","設定画面を開く（テーマ、モデル、通知など）。","","/config","settings.json");
T("claude","/status","すてーたす","/status|status|バージョン確認|アカウント情報|接続状態","バージョン、アカウント、使用モデル、接続状況などを表示する。","","/status","/doctor|/usage");
T("claude","/usage","ゆーさげ","/usage|usage|/cost|cost|使用量|使用状況|コスト確認|トークン使用量|使用上限の確認","使用量（トークン・コスト・プラン上限の残り）を確認する。","API利用なら /cost でセッションのコストが見られる。サブスクリプションの場合は /usage で利用枠を確認できる。","/usage\n/cost","レート制限|トークン");
T("claude","/context","こんてきすと","/context|context usage|コンテキスト使用量|コンテキスト可視化","コンテキストウィンドウの使用状況（何がどれだけ占めているか）を可視化する。","","/context","コンテキスト|/compact");
T("claude","/doctor","どくたー","/doctor|doctor|claude doctor|環境診断|インストール診断","インストールや設定の健全性を診断する。","起動しない・更新できない等の不調時に最初に試す。","/doctor","claude(インストール)");
T("claude","/login","ろぐいん","/login|login|/logout|logout|ログイン|ログアウト|認証|アカウント切り替え","ログイン／アカウント切り替え。/logout でログアウト。","ブラウザの認証画面が開く。APIキー利用とサブスク利用で課金が変わる点に注意。","/login\n/logout","APIキー");
T("claude","/mcp","えむしーぴー","/mcp|mcp|MCP管理|MCPサーバー一覧|MCP認証|claude mcp list","接続中のMCPサーバーの状態確認・認証を行う。","","/mcp","MCP|claude mcp add");
T("claude","/memory","めもり","/memory|memory|メモリ編集|CLAUDE.md 編集|#でメモリ追加","CLAUDE.md（メモリ）ファイルを編集する。","","/memory","CLAUDE.md|メモリ");
T("claude","/agents","えーじぇんつ","/agents|agents|サブエージェント管理|サブエージェント作成|エージェント管理","サブエージェントの一覧・作成・編集を行う。","","/agents","サブエージェント|.claude/agents");
T("claude","/hooks","ふっくす","/hooks|hooks設定|フック設定|hook を設定","hooks（自動実行フック）を設定する画面を開く。","","/hooks","hooks|settings.json");
T("claude","/review","れびゅー","/review|review|PRレビュー|コードレビュー|/pr-comments|/security-review|セキュリティレビュー|/code-review","コードやPRをAIにレビューさせる系のコマンド。","バージョンやプラグインにより存在するコマンドが異なる。/security-review は現在の変更に対するセキュリティ観点のレビュー。/pr-comments はPRのコメント取得。","/review\n/security-review","Pull Request|レビュー");
T("claude","/resume","りじゅーむ","/resume|resume|--resume|-r|--continue|-c|claude --continue|claude --resume|claude -c|claude -r|前回の続き|会話を再開|セッション再開|セッション履歴","過去の会話（セッション）を選んで再開する。","ターミナルから claude --continue（直近を再開）、claude --resume（一覧から選択）でも同じことができる。","/resume\nclaude --continue\nclaude --resume","セッション|/clear");
T("claude","/rewind","りわいんど","/rewind|rewind|checkpoint|チェックポイント|Esc Esc|巻き戻し|undo|変更を取り消す|/undo|rewind code","会話やコードの変更を、過去のチェックポイントまで巻き戻す。","Claude Codeは編集の前に自動でチェックポイントを作る。Escキーを2回押す(Esc Esc)でも開ける。ただしBashコマンドによる変更や外部への影響は戻らないため、Gitのcommitも併用する。","/rewind","Git|reset|チェックポイント");
T("claude","/add-dir","あっどでぃれくとり","/add-dir|--add-dir|add-dir|作業ディレクトリ追加|追加ディレクトリ|複数フォルダ","作業対象のフォルダを追加する（別ディレクトリのファイルも読み書きできるようにする）。","","/add-dir ../shared-lib\nclaude --add-dir ../shared-lib","権限");
T("claude","/terminal-setup","たーみなるせっとあっぷ","/terminal-setup|terminal-setup|Shift+Enter|改行キー設定|shift enter 改行|/vim|vim mode|vimモード","ターミナルで Shift+Enter 改行などが使えるようにする設定。/vim でvimキーバインド切替。","","/terminal-setup","Claude Code");
T("claude","/ide","あいでぃーいー","/ide|ide|IDE連携|VS Code拡張|Claude Code VS Code extension|JetBrains|IDE integration|IDE統合","VS Code等のIDEと連携する。","拡張機能を入れると、IDEで開いているファイル・選択範囲・診断(エラー)をClaudeが参照でき、差分もIDEの画面で確認できる。","/ide","VS Code|Claude Code");
T("claude","/output-style","あうとぷっとすたいる","/output-style|output style|出力スタイル|Explanatory|Learning|学習モード|説明モード","Claudeの返答スタイル（解説多め・学習向けなど）を切り替える。","","/output-style","システムプロンプト");
T("claude","/statusline","すてーたすらいん","/statusline|status line|ステータスライン|statusLine|画面下部の表示|ステータス行","画面下部のステータス表示（ブランチ名・モデル・コスト等）をカスタマイズする。","","/statusline","settings.json");
T("claude","/plugin","ぷらぐいん","/plugin|plugin|plugins|プラグイン|marketplace|マーケットプレイス|プラグインを入れる|/plugin install|claude plugin","スキル・コマンド・サブエージェント・hooks・MCPなどを1つにまとめて配布・導入できる拡張パッケージ。","マーケットプレイス（配布元）を追加して、そこからインストールする。チームの標準構成を共有するのに便利。","/plugin\n/plugin marketplace add <repo>\n/plugin install <name>@<marketplace>","Skills|サブエージェント|hooks|MCP");
T("claude","/todos","とぅどぅー","/todos|todos|TodoWrite|ToDoリスト|タスクリスト|TODO list|進捗リスト","Claudeが管理しているToDoリスト（作業の段取りと進捗）を表示する。","複数ステップの作業では、Claudeは自分でToDoリストを作り、1つずつ消化していく。","/todos","エージェントループ");
T("claude","/export","えくすぽーと","/export|export|会話を書き出す|会話エクスポート|ログ保存|transcript","会話の内容をファイルやクリップボードに書き出す。","","/export","");
T("claude","/bug","ばぐ","/bug|bug|/feedback|feedback|不具合報告|フィードバック送信|/release-notes|release-notes|リリースノート","Claude Codeの不具合・フィードバックを送る。/release-notes で更新内容を確認。","","/feedback\n/release-notes","");
T("claude","/install-github-app","いんすとーるぎっとはぶあっぷ","/install-github-app|install-github-app|GitHub App 連携|GitHub Actions セットアップ|@claude を使えるようにする","リポジトリに Claude の GitHub App と Actions ワークフローをセットアップする。","これにより、IssueやPRのコメントで @claude とメンションして作業を依頼できる。","/install-github-app","Claude Code GitHub Actions|メンション|GitHub App");
T("claude","/fast","ふぁすと","/fast|fast mode|ファストモード|高速モード|出力高速化","同じ高性能モデルのまま、出力を高速化するモードの切り替え。","速度優先の設定で、品質は維持しつつレスポンスを速くする（料金体系は通常と異なる場合あり）。","/fast","/model");
T("claude","/loop","るーぷ","/loop|loop|繰り返し実行|定期実行|ループコマンド|scheduled|定期チェック|/schedule","指示を一定間隔で繰り返し実行する（例：5分ごとにデプロイ状況を確認）。","バージョンや環境により提供状況が異なる。","/loop 5m デプロイの状況を確認して","エージェントループ|cron");

T("claude","ショートカットキー","しょーとかっときー","Shift+Tab|Esc|Esc Esc|Ctrl+C|Ctrl+D|Ctrl+R|Ctrl+O|Tab|@|!|#|ショートカット|keyboard shortcuts|キーボードショートカット|Option+T|Alt+T|Ctrl+L|Ctrl+B|Ctrl+G|矢印キー","Claude Codeの入力欄でよく使うキー操作。",
"Shift+Tab：パーミッションモード切替(通常→自動承認→プランモード等) ／ Esc：Claudeの作業を中断 ／ Esc Esc：巻き戻し(/rewind) ／ Ctrl+C：入力取り消し・中断(2回で終了) ／ Ctrl+D：終了 ／ @：ファイル名補完・参照 ／ !：入力行でそのままシェルコマンドを実行 ／ #：メモリ(CLAUDE.md)へ追記(旧仕様) ／ 行末に \\ + Enter または Shift+Enter：改行。キー割り当ては版や環境で異なるので /help も参照。",
`Shift+Tab    # モード切替
Esc          # 中断
Esc Esc      # 巻き戻し
@src/app.ts  # ファイルを指定
!git status  # シェル実行`,"パーミッションモード|/rewind|プランモード");

T("claude","@ファイル参照","あっとふぁいるさんしょう","@file|@|ファイルを指定|file mention|@src/|@フォルダ|@ メンション|ファイルメンション|@ファイル名","プロンプトに「@パス」と書いて、特定のファイル・フォルダを読ませる。","「@src/auth.ts を見て、ログインのバグを直して」のように使う。Tabキーで補完でき、フォルダを指定すると一覧が渡る。","@src/components/Header.tsx のレイアウトを直して","コンテキスト|ショートカットキー");

T("claude","パーミッションモード","ぱーみっしょんもーど","permission mode|permission modes|--permission-mode|default|acceptEdits|plan|bypassPermissions|auto-accept edits|acceptEdits モード|defaultMode|権限モード|自動承認モード|auto mode|dontAsk","Claude Codeが操作をどこまで自動で行うかを決めるモード。",
"default：書き込み・コマンドは毎回確認 ／ acceptEdits：ファイル編集は確認なし ／ plan：実装せず計画だけ立てる(読み取り専用) ／ bypassPermissions：すべて確認なし(非常に危険。隔離環境のみ) ／ その他、分類器が安全性を判定して自動承認するモードなど版により追加される。Shift+Tab で切り替え、起動時は --permission-mode で指定できる。",
`claude --permission-mode plan
claude --permission-mode acceptEdits`,"プランモード|--dangerously-skip-permissions|権限|承認モード");

T("claude","プランモード","ぷらんもーど","plan mode|Plan Mode|プラン|計画モード|--permission-mode plan|ExitPlanMode|read-only plan|プランを立てる|plan","コードを変更せず、調査して実装計画だけを立てさせるモード。",
"Shift+Tabで切り替え(または --permission-mode plan)。Claudeはファイルを読んで調べ、計画を提示する。人間が計画を承認するまで編集やコマンド実行は行わない。大きな変更・不慣れなコードベースで特に有効。","claude --permission-mode plan","パーミッションモード|推論|サブエージェント");

T("claude","--dangerously-skip-permissions","だんじゃらすりーすきっぷぱーみっしょんず","--dangerously-skip-permissions|dangerously-skip-permissions|bypassPermissions|YOLO|yolo|許可を全部スキップ|全部許可|確認なしで実行|permissions スキップ","すべての承認確認を無効にして、Claudeが自動で何でも実行するようになる危険なオプション。",
"名前の通り危険：ファイル削除、秘密情報の読み取り、外部送信、プロンプトインジェクションによる乗っ取り等のリスクが直撃する。使うなら、使い捨てのコンテナ/VM・ネットワーク制限・Git管理下・秘密情報なしの環境に限る。",
`claude --dangerously-skip-permissions   # 隔離環境でのみ！`,"パーミッションモード|サンドボックス|プロンプトインジェクション|Docker");

T("claude","claude -p","くろーどぴー","claude -p|-p|--print|print mode|headless|ヘッドレス|headless mode|非対話モード|非対話|--output-format|--output-format json|stream-json|--max-turns|スクリプトから呼ぶ|パイプ|pipe|claude -p \"","非対話モード。1回の指示を実行して結果を標準出力に返して終了する。スクリプトやCIで使う。",
"-p（--print）を付けると、対話UIを出さずに結果だけを出力する。パイプでファイルやログを渡したり、--output-format json で機械処理しやすい形式にしたり、--max-turns で往復回数を制限したりできる。GitHub Actionsなど自動化の基本。",
`claude -p "このdiffをレビューして" < change.diff
git diff | claude -p "変更点を要約して"
claude -p "テストを直して" --max-turns 10 --output-format json`,"Claude Code|GitHub Actions|--allowedTools");

T("claude","CLIオプション","しーえるあいおぷしょん","--model|--verbose|--debug|--add-dir|--allowedTools|--disallowedTools|--append-system-prompt|--system-prompt|--mcp-config|--settings|--version|-v|--help|-h|--continue|--resume|--permission-mode|--output-format|--input-format|--max-turns|--session-id|--fork-session|--ide|--worktree|--teleport|claude --help|フラグ|オプション一覧|フラグ一覧","claude コマンドに付けられる主なオプション（フラグ）の一覧。",
"--model：モデル指定 ／ -p,--print：非対話実行 ／ -c,--continue：直近の会話を再開 ／ -r,--resume：会話を選んで再開 ／ --permission-mode：権限モード ／ --allowedTools / --disallowedTools：ツールの許可・拒否 ／ --add-dir：作業フォルダ追加 ／ --append-system-prompt：システムプロンプト追記 ／ --mcp-config：MCP設定ファイル ／ --output-format：text/json/stream-json ／ --max-turns：最大往復数 ／ --verbose,--debug：詳細ログ ／ --dangerously-skip-permissions：確認すべて省略(危険)。※ 版により増減するので claude --help が正。",
`claude --help
claude --model opus
claude -c
claude -p "要約して" --output-format json`,"claude -p|パーミッションモード|--allowedTools");

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

T("claude","hooks","ふっくす","hooks|hook|フック|PreToolUse|PostToolUse|UserPromptSubmit|Stop|SubagentStop|SessionStart|SessionEnd|Notification|PreCompact|matcher|Claude Code hooks|フック設定","Claude Codeの動作の特定のタイミングで、自動的にコマンドを実行する仕組み。",
"例：PreToolUse（ツール実行前：危険なコマンドをブロック）、PostToolUse（編集後：自動でフォーマッタやlintを実行）、UserPromptSubmit（入力時：文脈を追加）、Stop（応答完了時：通知やテスト）、SessionStart（開始時：環境準備）、Notification（通知）。「AIに頼む」ではなく「必ず実行される」ルールにしたいときに使う。settings.jsonに記述、/hooksで設定。",
`{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx prettier --write ." }]
    }]
  }
}`,"settings.json|ガードレール|git hook|/hooks");

T("claude","サブエージェント","さぶえーじぇんと","subagent|sub-agent|subagents|Task tool|Agent tool|.claude/agents|サブエージェント|専門エージェント|カスタムエージェント|custom agent|Explore agent|Plan agent|general-purpose","特定の役割に特化した別のエージェント。メインの作業とは別のコンテキストで動く。",
"例：調査専門、コードレビュー専門、テスト作成専門。長い調査をサブエージェントに任せると、メインの会話のコンテキストが汚れない。.claude/agents/名前.md に役割・使えるツール・指示を書いて定義する。Claudeが自動で呼び出すことも、「◯◯エージェントを使って」と指示して呼ぶこともできる。並列に走らせることも可能。",
`# .claude/agents/reviewer.md
---
name: reviewer
description: コード変更をレビューする専門家
tools: Read, Grep, Glob
---
あなたは厳格なコードレビュアーです。...`,"マルチエージェント|/agents|コンテキストエンジニアリング|Skills");

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

T("claude","Claude Code on the web","くろーどこーどおんざうぇぶ","Claude Code Web|cloud session|クラウドセッション|リモートセッション|remote session|claude.ai/code|teleport|--teleport|--remote|Web版 Claude Code|クラウド実行|remote execution","ブラウザ/アプリから使える、クラウド上で動くClaude Code。PCを開いていなくても作業が進む。",
"GitHubリポジトリをつなぐと、クラウドの隔離コンテナ上でリポジトリをcloneして作業し、ブランチにpushする。スマホからでも依頼でき、PRを作らせることもできる。コンテナは一時的なので、成果は必ずcommit/pushして保存する。環境ごとにネットワーク制限・環境変数・セットアップスクリプトを設定できる。","","Claude Code|サンドボックス|git push|環境変数");

T("claude","Checkpoints","ちぇっくぽいんと","checkpoint|checkpoints|チェックポイント|自動セーブ|コード巻き戻し|restore checkpoint","Claudeが編集する前に自動で取る、ファイルの状態のスナップショット。","/rewind か Esc Esc で呼び出し、会話・コード・両方のどれを戻すか選べる。Gitの代わりではなく補助。","","/rewind|git reset|git commit");

T("claude","セッション","せっしょん","session|セッション|session id|--session-id|会話セッション|~/.claude/projects|transcript|セッション履歴|session history|fork","Claude Codeでの1つの会話のまとまり。履歴は保存され、後から再開できる。","同じフォルダでの過去の会話は claude --continue / --resume で再開できる。別の流れで試したいときは分岐(fork)も可能。","claude --continue\nclaude --resume","/resume|/clear|コンテキスト");

T("claude","Claude Code SDK","くろーどこーどえすでぃーけー","Claude Code SDK|Claude Agent SDK|@anthropic-ai/claude-code SDK|claude-agent-sdk|query()|SDKからClaude Codeを使う","Claude Codeのエージェント機能をプログラムから使うためのSDK（現在は Claude Agent SDK）。","","","Agent SDK|claude -p");

T("claude","ANTHROPIC_API_KEY","あんそろぴっくえーぴーあいきー","ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_MODEL|ANTHROPIC_BASE_URL|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|DISABLE_TELEMETRY|MAX_THINKING_TOKENS|環境変数 Claude Code","Claude Codeが参照する主な環境変数。APIキーでの認証、モデル指定、AWS Bedrock/Google Vertex経由の利用切替などに使う。",
"ANTHROPIC_API_KEY=APIキー認証／ANTHROPIC_MODEL=既定モデル／CLAUDE_CODE_USE_BEDROCK・CLAUDE_CODE_USE_VERTEX=クラウド経由で利用／MAX_THINKING_TOKENS=思考トークン上限、など。settings.jsonの env でも設定可能。","export ANTHROPIC_API_KEY=\"sk-ant-...\"","APIキー|環境変数|settings.json");

T("claude","ultrathink","うるとらしんく","ultrathink|think|think hard|think harder|megathink|拡張思考キーワード|考えさせる","プロンプトに書くと、Claudeにより深く考えさせる合図となるキーワード。","think < think hard < ultrathink の順で思考量が増える（バージョンや設定によって挙動は異なる）。複雑な設計やバグ調査向けで、時間とトークンは増える。","ultrathink このバグの根本原因を調べて","推論|プランモード");

T("claude","バックグラウンド実行","ばっくぐらうんどじっこう","background task|background|run_in_background|バックグラウンドタスク|dev server|長時間コマンド|Ctrl+B|&|bashes|/bashes|バックグラウンドでコマンド","開発サーバーなど長く動き続けるコマンドを、裏で走らせながら作業を続ける機能。","Claudeはサーバーを起動したまま、ログを確認したり別の作業を進めたりできる。","","Bash|エージェントループ");

T("claude","Claude Code 画像貼り付け","がぞうはりつけ","画像貼り付け|スクリーンショット|paste image|Ctrl+V|image paste|画像をドラッグ|デザインカンプ|スクショを渡す","スクリーンショットやデザイン画像を貼り付けて、見た目を指示する機能。","ターミナルに画像をドラッグ＆ドロップ／貼り付け（Ctrl+V）すると、Claudeが画像を見て「この通りに直して」に応えられる。","","マルチモーダル");

T("claude","Claude Code 使い方のコツ","つかいかたのこつ","explore plan code commit|探索→計画→実装→コミット|TDD with Claude|テスト駆動|小さく頼む|コツ|best practices|ベストプラクティス|workflow","Claude Codeをうまく使う基本の流れ。","①まず調査(読むだけ)させる→②プランモードで計画→③実装→④テスト実行→⑤commit/PR。こまめに /clear や /compact、重要ルールは CLAUDE.md、危険操作は deny/hooks で守る。Gitで常に戻せる状態にしておく。","","プランモード|CLAUDE.md|/clear|git commit");
