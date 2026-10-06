/* ===== Claude Code ===== */
T("claude","Claude Code","くろーどこーど","claude code|claude|claudeコマンド|クロードコード|Claude Code CLI|claude-code|@anthropic-ai/claude-code|claude.ai/code","Anthropicが提供する、ターミナル等で動くAIコーディングエージェント。",
"プロジェクトのフォルダで claude と打って起動し、日本語で「このバグを直して」「テストを書いて」と頼むと、ファイルを読み・編集し・コマンドを実行して作業する。ターミナル(CLI)のほか、VS Code/JetBrains拡張、デスクトップアプリ、Web版(claude.ai/code)、GitHub Actions連携などで使える。操作の許可は都度確認でき、設定で自動化もできる。",
`cd my-project
claude                      # 対話モードで起動
claude "READMEを要約して"     # 最初の指示つきで起動
claude -p "テストを実行して結果を要約"   # 1回だけ実行して終了`,"CLAUDE.md|スラッシュコマンド|パーミッションモード|サブエージェント|hooks|MCP");

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

T("claude","Checkpoints","ちぇっくぽいんと","checkpoint|checkpoints|チェックポイント|自動セーブ|コード巻き戻し|restore checkpoint","Claudeが編集する前に自動で取る、ファイルの状態のスナップショット。","/rewind か Esc Esc で呼び出し、会話・コード・両方のどれを戻すか選べる。Gitの代わりではなく補助。","","git reset|git commit");

T("claude","セッション","せっしょん","session|セッション|session id|--session-id|会話セッション|~/.claude/projects|transcript|セッション履歴|session history|fork","Claude Codeでの1つの会話のまとまり。履歴は保存され、後から再開できる。","同じフォルダでの過去の会話は claude --continue / --resume で再開できる。別の流れで試したいときは分岐(fork)も可能。","claude --continue\nclaude --resume","/resume|/clear|コンテキスト");

T("claude","ANTHROPIC_API_KEY","あんそろぴっくえーぴーあいきー","ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_MODEL|ANTHROPIC_BASE_URL|CLAUDE_CODE_USE_BEDROCK|CLAUDE_CODE_USE_VERTEX|DISABLE_TELEMETRY|MAX_THINKING_TOKENS|環境変数 Claude Code","Claude Codeが参照する主な環境変数。APIキーでの認証、モデル指定、AWS Bedrock/Google Vertex経由の利用切替などに使う。",
"ANTHROPIC_API_KEY=APIキー認証／ANTHROPIC_MODEL=既定モデル／CLAUDE_CODE_USE_BEDROCK・CLAUDE_CODE_USE_VERTEX=クラウド経由で利用／MAX_THINKING_TOKENS=思考トークン上限、など。settings.jsonの env でも設定可能。","export ANTHROPIC_API_KEY=\"sk-ant-...\"","APIキー|環境変数|settings.json");

T("claude","ultrathink","うるとらしんく","ultrathink|think|think hard|think harder|megathink|拡張思考キーワード|考えさせる","プロンプトに書くと、Claudeにより深く考えさせる合図となるキーワード。","think < think hard < ultrathink の順で思考量が増える（バージョンや設定によって挙動は異なる）。複雑な設計やバグ調査向けで、時間とトークンは増える。","ultrathink このバグの根本原因を調べて","推論|プランモード");

T("claude","バックグラウンド実行","ばっくぐらうんどじっこう","background task|background|run_in_background|バックグラウンドタスク|dev server|長時間コマンド|Ctrl+B|&|bashes|/bashes|バックグラウンドでコマンド|バックグラウンド|background","開発サーバーなど長く動き続けるコマンドを、裏で走らせながら作業を続ける機能。","Claudeはサーバーを起動したまま、ログを確認したり別の作業を進めたりできる。","","Bash|エージェントループ");

T("claude","Claude Code 画像貼り付け","がぞうはりつけ","画像貼り付け|スクリーンショット|paste image|Ctrl+V|image paste|画像をドラッグ|デザインカンプ|スクショを渡す|スクショ","スクリーンショットやデザイン画像を貼り付けて、見た目を指示する機能。","ターミナルに画像をドラッグ＆ドロップ／貼り付け（Ctrl+V）すると、Claudeが画像を見て「この通りに直して」に応えられる。","","マルチモーダル");

T("claude","Claude Code 使い方のコツ","つかいかたのこつ","explore plan code commit|探索→計画→実装→コミット|TDD with Claude|テスト駆動|小さく頼む|コツ|best practices|ベストプラクティス|workflow","Claude Codeをうまく使う基本の流れ。","①まず調査(読むだけ)させる→②プランモードで計画→③実装→④テスト実行→⑤commit/PR。こまめに /clear や /compact、重要ルールは CLAUDE.md、危険操作は deny/hooks で守る。Gitで常に戻せる状態にしておく。","","プランモード|CLAUDE.md|/clear|git commit");

/* ===== 2026年版ドキュメントに基づく更新・追加（公式: code.claude.com/docs） ===== */
T("claude","claude(インストール)","くろーどいんすとーる","install claude code|npm install -g @anthropic-ai/claude-code|claude update|claude --version|claude -v|claude doctor|claude install|claude install stable|claude auth login|claude auth logout|claude auth status|claude setup-token|インストール|アップデート|native installer|ネイティブインストーラー|ログイン|サインイン|setup-token|doctor|stable|latest","Claude Codeのインストール・更新・ログイン・診断に使うコマンド。",
"公式のインストーラ（macOS/Linux/WSLはcurlスクリプト、Windowsは専用スクリプトやWinGet等）か、Node.js環境ならnpmで入れる。claude install [version] でネイティブ版を入れ直し・バージョン指定（stable / latest / 2.1.x など）、claude update で更新。ログインは claude auth login（--console でAPI課金、--sso でSSO）。claude auth status で認証状況、claude setup-token はCI用の長期トークン発行。claude doctor は起動せずに診断。方法は更新されるので公式のセットアップページも確認。",
`npm install -g @anthropic-ai/claude-code
claude --version
claude update
claude install stable
claude auth login
claude auth status
claude doctor`,"Claude Code|/login|APIキー");

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

T("claude","effort level","えふぉーとれべる","effort level|adaptive reasoning|適応的推論|アダプティブ|思考レベル|thinking effort|ultracode|MAX_THINKING_TOKENS|effortLevel|xhigh|low|medium|high|max","モデルが各ステップでどれだけ深く考えるかを決める設定。","高いほど思考トークンが増えて深い推論、低いほど速く安い。/effort、--effort、/model画面の左右キー、settings の effortLevel で設定。extended thinking（考える過程の表示）は effort で調整し、固定予算のモデルでは MAX_THINKING_TOKENS で上限を決める。","","/effort|extended thinking|推論");

T("claude","ショートカットキー","しょーとかっときー","Shift+Tab|Esc|Esc Esc|Ctrl+C|Ctrl+D|Ctrl+R|Ctrl+O|Ctrl+B|Ctrl+T|Ctrl+G|Ctrl+S|Ctrl+V|Ctrl+L|Ctrl+Z|Option+P|Alt+P|Option+T|Alt+T|Option+O|Alt+O|Tab|@|!|#|?|ショートカット|keyboard shortcuts|キーボードショートカット|入力モード|矢印キー|terminal-setup|シェルモード|shell mode","Claude Codeの入力欄でよく使うキー操作と先頭記号。",
"Shift+Tab：パーミッションモード切替 ／ Esc：Claudeを中断・ダイアログを閉じる ／ Esc Esc：入力の消去または巻き戻し(/rewind) ／ Ctrl+C：中断・入力クリア(もう一度で終了) ／ Ctrl+D：終了 ／ Ctrl+R：履歴検索 ／ Ctrl+O：トランスクリプト表示 ／ Ctrl+B：実行中タスクをバックグラウンドへ ／ Ctrl+T：タスクチェックリスト表示 ／ Ctrl+G：エディタで入力を開く ／ Ctrl+S：入力の一時退避 ／ Ctrl+V：画像貼り付け ／ Option/Alt+P：モデル切替 ／ Option/Alt+T：拡張思考 ／ Option/Alt+O：高速モード ／ 行頭の / ：コマンド・スキル ／ 行頭の ! ：シェルモード ／ @：ファイル参照 ／ ? ：ショートカット一覧。改行は Shift+Enter（/terminal-setup で設定）。割り当ては版や端末で異なるので /help も参照。",
`Shift+Tab    # モード切替
Esc          # 中断
Esc Esc      # 巻き戻し
@src/app.ts  # ファイルを指定
!git status  # シェル実行`,"パーミッションモード|プランモード|@ファイル参照");

T("claude","Vimモード","ぶいあいえむもーど","vim mode|vimモード|vimキーバインド|Editor mode|/vim|NORMAL mode|ノーマルモード|入力欄のVim|NORMAL|INSERT","入力欄をVimのキー操作（NORMAL/INSERT）で編集できるモード。","/vim コマンドは廃止され、/config → Editor mode で切り替える。Esc でNORMALモード、i/a/o で挿入、h j k l で移動、dd で行削除、ciw等の編集が使える。","/config","ショートカットキー|vim");

T("claude","パーミッションモード","ぱーみっしょんもーど","permission mode|permission modes|--permission-mode|default|manual|Manual|acceptEdits|plan|auto|auto mode|dontAsk|bypassPermissions|auto-accept edits|defaultMode|権限モード|自動承認モード|Shift+Tab","Claude Codeが操作をどこまで確認なしで行うかを決めるモード。Shift+Tab で切り替える。",
"default（画面上はManual）：読み取り以外は毎回確認 ／ acceptEdits：ファイル編集と mkdir・mv・cp などは確認なし ／ plan：調べて計画だけ立て、承認までは編集しない ／ auto：別の分類器モデルが操作を審査し、安全なものは確認なしで実行（v2.1.283以降は対話セッションの既定。危険操作・プロンプトインジェクションはブロック） ／ dontAsk：許可ルールにないものは拒否（質問しない） ／ bypassPermissions：確認を全部省略（非常に危険。隔離環境のみ）。起動時は --permission-mode、設定は defaultMode。",
`claude --permission-mode plan
claude --permission-mode acceptEdits
claude --permission-mode auto`,"auto mode|プランモード|--dangerously-skip-permissions|権限|承認モード|permission rule");

T("claude","auto mode","おーともーど","auto mode|オートモード|自動モード|classifier|分類器|/auto-mode-setup|claude auto-mode|autoMode|--permission-mode auto","別の分類器モデルが操作を審査して、人間の確認を減らすパーミッションモード。",
"各操作を分類器がレビューし、問題なければ自動実行、スコープ逸脱・信頼できないインフラ・プロンプトインジェクションの疑いはブロックする。分類器にはツール結果が見えない（悪意ある文面で操縦されにくい）。あなたの ask ルールに一致するものは確認される。設定の確認は claude auto-mode defaults / config、リセットは claude auto-mode reset、/auto-mode-setup で環境の説明を下書き。","claude --permission-mode auto\nclaude auto-mode defaults","パーミッションモード|プロンプトインジェクション|permission rule");

T("claude","permission rule","ぱーみっしょんるーる","permission rules|許可ルール|allow ルール|ask ルール|deny ルール|Bash(git log *)|Read(./.env)|Edit(|WebFetch(domain:|mcp__|ルール構文|permission rule syntax|権限ルール|permissions.allow|permissions.deny|permissions.ask","ツール名と引数パターンで「許可・確認・拒否」を決める設定エントリ。",
"評価順は deny → ask → allow で、最初に一致したものが有効。例：Bash(git log *) は git log 系だけ許可、Read(./.env) の deny で .env の読み取り禁止、mcp__* でMCPツール全体。パーミッションモードより細かい制御で、/permissions や settings.json の permissions で管理する。","{ \"permissions\": { \"allow\": [\"Bash(npm run test *)\"], \"deny\": [\"Read(./.env)\", \"Bash(rm *)\"] } }","権限|settings.json|/permissions|--allowedTools");

T("claude","hooks","ふっくす","hooks|hook|フック|PreToolUse|PostToolUse|PostToolUseFailure|PermissionRequest|PermissionDenied|UserPromptSubmit|UserPromptExpansion|Stop|StopFailure|SubagentStart|SubagentStop|SessionStart|SessionEnd|Notification|PreCompact|PostCompact|InstructionsLoaded|ConfigChange|CwdChanged|FileChanged|WorktreeCreate|WorktreeRemove|TaskCreated|TaskCompleted|TeammateIdle|Elicitation|matcher|Claude Code hooks|フック設定|hook event|ライフサイクルフック|lifecycle hook","Claude Codeのライフサイクルの決まった時点で、自動的にコマンド等を実行する仕組み。",
"「AIに頼む」のではなく「必ず実行される」ルールにしたいときに使う。主なイベント：SessionStart / SessionEnd、UserPromptSubmit（入力時）、PreToolUse（ツール実行前：ブロック可）、PermissionRequest / PermissionDenied、PostToolUse / PostToolUseFailure（実行後：整形・lint）、Notification、SubagentStart / SubagentStop、TaskCreated / TaskCompleted、Stop / StopFailure（応答完了・API失敗）、PreCompact / PostCompact、InstructionsLoaded、ConfigChange、CwdChanged、FileChanged、WorktreeCreate / WorktreeRemove、Elicitation など約30種。ハンドラ種別は command（シェル）／http（POST）／mcp_tool／prompt（LLM判定）／agent（サブエージェント検証）。構成は「イベント＋matcher＋ハンドラ」。settings.json に記述、/hooks で確認。",
`{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx prettier --write ." }]
    }]
  }
}`,"settings.json|ガードレール|git hook|/hooks|matcher");

T("claude","サブエージェント","さぶえーじぇんと","subagent|sub-agent|subagents|Task tool|Agent tool|.claude/agents|サブエージェント|専門エージェント|カスタムエージェント|custom agent|Explore|Plan agent|general-purpose|--agent|--agents|isolation: worktree|forked subagent|フォーク|subtask|/subtask","特定の役割に特化した別のエージェント。メインとは別のコンテキストウィンドウ・権限で動く。",
"例：調査専門、コードレビュー専門、テスト作成専門。長い調査を任せると、メインの会話が汚れない。.claude/agents/名前.md の frontmatter（description・tools など）と本文の指示で定義する。組み込みは Explore・Plan・general-purpose。claude --agent 名前 でそのエージェントとして起動、--agents でJSON定義、/subtask で現在の会話を引き継いだ“フォーク”サブエージェントを背景で実行。isolation: worktree で別のgit worktreeに隔離できる。サブエージェントは所属セッション内に留まり、別セッション間は cross-session messaging を使う。",
`# .claude/agents/reviewer.md
---
name: reviewer
description: コード変更をレビューする専門家
tools: Read, Grep, Glob
---
あなたは厳格なコードレビュアーです。...`,"マルチエージェント|/agents|Agent teams|worktree isolation|frontmatter|Skills");

T("claude","claude -p","くろーどぴー","claude -p|-p|--print|print mode|headless|headless mode|ヘッドレス|ヘッドレスモード|非対話モード|非対話|non-interactive|--output-format|--output-format json|stream-json|--max-turns|スクリプトから呼ぶ|パイプ|pipe|claude -p \"|--permission-prompts|--no-session-persistence","非対話モード（旧称ヘッドレス）。1回の指示を実行して結果を出力して終了する。スクリプトやCI向け。",
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

T("claude","--safe-mode","せーふもーど","--safe-mode|safe mode|セーフモード|CLAUDE_CODE_SAFE_MODE|設定を全部無効で起動|トラブルシュート 起動","CLAUDE.md・スキル・プラグイン・フック・MCPなどカスタマイズをすべて無効にして起動するトラブルシューティング用モード。","認証・モデル選択・組み込みツール・権限は通常どおり。設定が原因で壊れていないかの切り分けに使う（--bareとは別物）。","claude --safe-mode","--bare|claude doctor");

T("claude","--worktree","わーくつりー","--worktree|-w|claude -w|git worktree claude|worktree isolation|.claude/worktrees|--tmux|ワークツリー隔離|isolation: worktree|WorktreeCreate|WorktreeRemove|worktrees","隔離したgit worktree（<repo>/.claude/worktrees/名前）でClaudeを起動するオプション。","並列に走らせるセッションが互いのファイルを壊さない。#123 やPRのURLを渡すと、そのPR/MRをoriginから取得してworktreeを作る。--tmux でtmuxセッション付き。サブエージェントは isolation: worktree で同様に隔離できる。","claude -w feature-auth\nclaude -w #123","git worktree|サブエージェント");

T("claude","--tools","つーるず","--tools|--allowed-tools|--disallowedTools|ツール制限|使えるツールを絞る|--tools \"\"|--tools default","使える組み込みツールそのものを制限するオプション（許可プロンプトの省略とは別）。","--tools \"Bash,Edit,Read\" のように指定。\"\" で全無効、default で既定セット。MCPツールには効かないので --disallowedTools \"mcp__*\" を併用。許可ルールで承認を省略するのは --allowedTools。","claude --tools \"Bash,Edit,Read\"","--allowedTools|ツール(Claude Code)");

T("claude","--max-budget-usd","まっくすばじぇっと","--max-budget-usd|max budget|予算上限|費用上限|コスト上限|--max-turns|上限金額","非対話実行で使うAPI費用の上限（ドル）を決めるオプション。","上限に達すると停止し、サブエージェントの起動も失敗する。クライアント側の推定値なので請求額とは差が出る。往復回数の上限は --max-turns。","claude -p --max-budget-usd 5.00 \"query\"","claude -p|レート制限");

T("claude","--fallback-model","ふぉーるばっくもでる","--fallback-model|fallbackModel|フォールバックモデル|自動フォールバック|モデルが過負荷|model fallback","主モデルが過負荷や利用不可のとき、自動で別モデルに切り替える設定。","カンマ区切りで順番に試す。claude --fallback-model sonnet,haiku。永続化は fallbackModel 設定。","claude --fallback-model sonnet,haiku","/model|Claude");

T("claude","--json-schema","じぇいそんすきーま","--json-schema|JSON Schema|構造化出力 claude|validated JSON|スキーマ検証","指定したJSON Schemaに合う検証済みJSONを出力させるオプション（非対話モード専用）。","スクリプトでClaudeの結果を確実に機械処理したいときに使う。","claude -p --json-schema '{\"type\":\"object\"}' \"query\"","claude -p|構造化出力");

T("claude","--name","ねーむ","--name|-n|セッション名|/rename|session name|名前をつけて再開|claude --resume <name>","セッションに表示名を付けるオプション。/resumeや端末タイトルに出て、名前で再開できる。","claude -n \"my-feature\" で付け、claude --resume my-feature で再開。実行中は /rename で変更（名前省略で自動生成）。","claude -n my-feature-work\nclaude --resume my-feature-work","セッション|/resume");

T("claude","--fork-session","ふぉーくせっしょん","--fork-session|fork session|セッション分岐|/fork|/branch|会話を分岐|ブランチ会話","再開時に元と別のセッションIDで分岐させるオプション（/fork・/branch もある）。","元の会話を壊さずに別の方向を試せる。/branch は会話をその時点で分岐、/fork は現在の会話を背景セッションにコピーして手元で作業を続ける。","claude --resume abc123 --fork-session","セッション|/resume");

T("claude","--from-pr","ふろむぴーあーる","--from-pr|from pr|PRに紐づくセッション|PRからセッション再開","特定のPull Requestに紐づいたセッションを絞り込んで再開するオプション。","PR番号、GitHub/GitHub EnterpriseのPR URL、GitLabのMR、BitbucketのPRのURLを受け取る。ClaudeがPRを作ると自動で紐づく。","claude --from-pr 123","セッション|Pull Request");

T("claude","verification loop","べりふぃけーしょんるーぷ","verification loop|検証ループ|検証手段|テストで確認|Claudeが自分で確認|give Claude a way to verify","「本当に終わったか」を、Claude自身が実行して確かめられる仕組み（テスト・ビルド・スクショ比較など）。","検証手段があれば、成功するまで反復できる。/goal・無人実行・動的ワークフローの前提。「完了」の判断をAI任せにしない。指示するときは「テストを実行して通るまで直して」と書くのが基本。","","/goal|テスト|エージェントループ");

T("claude","エージェントビュー","えーじぇんとびゅー","agent view|claude agents|claude agents --json|claude attach|claude logs|claude stop|claude kill|claude respawn|claude rm|claude daemon|supervisor|並列セッション管理|attach|respawn|daemon","複数のバックグラウンドセッションを一覧・監視・指示できる画面（claude agents）。",
"claude agents で開く（--json でスクリプト用出力、--cwd で絞り込み）。管理コマンド：claude attach <id|名前>（接続）、claude logs（出力表示）、claude stop（停止）、claude respawn（会話を保ったまま再起動）、claude rm（一覧から削除）、claude daemon status/stop（背景を支える監視プロセスの状態確認・停止）。","claude agents\nclaude attach 7c5dcf5d\nclaude logs 7c5dcf5d","/background|サブエージェント");

T("claude","Agent teams","えーじぇんとちーむ","agent teams|エージェントチーム|teammate|チームメイト|team lead|--teammate-mode|teammateMode|TeammateIdle|実験機能|チームリード|lead|iterm2|in-process|tmux","チームリードが複数の独立したClaude Codeセッション（チームメイト）を共有タスクリストで調整する実験的機能。","サブエージェントと違い、各チームメイトが自分のコンテキストを持ち、直接やり取りもできる。既定は無効。表示は --teammate-mode（in-process / auto / tmux / iterm2）。","claude --teammate-mode tmux","サブエージェント|マルチエージェント|オーケストレーター");

T("claude","クラウドセッション","くらうどせっしょん","cloud session|Cloud session|クラウドセッション|Claude Code on the web|Claude Code Web|claude.ai/code|リモートセッション|remote session|--cloud|--remote|--teleport|/teleport|/web-setup|/remote-env|self-hosted environment|Web版 Claude Code|クラウド実行|ccpool_","自分のPCではなくクラウド上で動くClaude Codeセッション。PCを閉じても作業が続く。",
"claude.ai/code、モバイルアプリ、Desktop（Cloud選択）、claude --cloud \"依頼\"、ルーティンから開始できる。リポジトリはクラウドの隔離コンテナにcloneされ、ブランチにpushされる（コンテナは一時的なので成果は必ずcommit/pushして残す）。クラウド→手元は /teleport（claude --teleport）、手元→クラウドは --cloud（--remote は旧名）。/web-setup でGitHub認証、/remote-env で既定環境を選択。組織が運用する“セルフホスト環境”（claude self-hosted-runner）も選べる。「Claude Code on the web」は現在、claude.ai/code のブラウザ画面だけを指す名称。","claude --cloud \"ログインのバグを直して\"\nclaude --teleport","Remote Control|teleport|サンドボックス|git push|環境変数");

T("claude","Remote Control","りもーとこんとろーる","remote control|/remote-control|claude remote-control|--remote-control|--rc|リモートコントロール|スマホから操作|手元のセッションを遠隔操作","手元で動いているClaude Codeセッションを、スマホやブラウザ（claude.ai）から続けて操作できる機能。","コードの実行やファイルは自分のPCに残り、操作画面だけがリモートになる。クラウドで実行する「クラウドセッション」とは別物。claude remote-control で専用サーバーモードを起動。","claude --remote-control \"My Project\"\n/remote-control","クラウドセッション|teleport");

T("claude","teleport","てれぽーと","teleport|/teleport|--teleport|テレポート|クラウドセッションを手元に|cloud to terminal","クラウドセッションを手元のターミナルに引き寄せるコマンド（/teleport、claude --teleport）。","Claudeがブランチと会話履歴を取得し、クラウド側の最後の状態から再開する。逆方向（手元→クラウド）は --cloud。","/teleport","クラウドセッション|Remote Control");

T("claude","Plugin マーケットプレイス","ぷらぐいんまーけっとぷれいす","claude plugin|claude plugins|plugin install|plugin marketplace|marketplace|マーケットプレイス|/plugin marketplace add|code-review@claude-plugins-official|--plugin-dir|--plugin-url|/reload-plugins|plugin manifest|plugin.json","プラグイン（スキル・フック・サブエージェント・MCPの詰め合わせ）の配布元と、導入コマンド。",
"claude plugin install 名前@マーケットプレイス、/plugin（メニュー）、--plugin-dir（そのセッションだけ読込）。プラグインのスキルは plugin名:skill名 で名前空間が分かれる。変更を反映するのは /reload-plugins。信頼できる提供元のものだけ入れる（フックやMCPが実行されるため）。","claude plugin install code-review@claude-plugins-official\n/reload-plugins","Skills|hooks|サブエージェント");

T("claude","auto memory","おーともめもりー","auto memory|自動メモリ|MEMORY.md|~/.claude/projects|Claudeが自分で書くメモ|メモリ自動","あなたの修正や好みをもとに、Claudeが自分で書き溜める覚え書き。","リポジトリごとに ~/.claude/projects/ 以下に保存され、同じリポジトリのworktreeは共有。MEMORY.md の最初の200行/25KBが毎回読み込まれる。人が書くのが CLAUDE.md、Claudeが書くのが auto memory。/memory で確認・オフ切替。","/memory","CLAUDE.md|/memory|メモリ");

T("claude",".claude/rules","るーるず","rules|.claude/rules|ルールファイル|paths:|パススコープ|path-scoped rules|path scoped","CLAUDE.mdと一緒に読み込まれる、分割した指示ファイル群（.claude/rules/*.md）。","frontmatter の paths: で対象ファイルを限定でき、一致するファイルを読み書きしたときだけ読み込まれるため、コンテキストを節約できる。","","CLAUDE.md|frontmatter|コンテキスト");

T("claude","frontmatter","ふろんとまった","frontmatter|フロントマター|YAML frontmatter|---|SKILL.md frontmatter|description:|tools:|name:|ファイル先頭のYAML","Markdownファイルの先頭にある、---で囲んだYAML設定ブロック。","スキル・サブエージェント・出力スタイル・ルールが設定（description や tools など）をここに書き、閉じ---以降を本文の指示として扱う。最初の行が --- である必要がある。","---\nname: my-skill\ndescription: いつ使うか\n---\n手順…","Skills|サブエージェント|.claude/rules");

T("claude",".claude ディレクトリ","どっとくろーどでぃれくとり","~/.claude|.claude directory|.claude folder|.claude/|.claude/settings.json|.claude/skills|.claude/agents|.claude/commands|.claude/rules|~/.claude.json|claude purge|設定フォルダ","Claude Codeがプロジェクト用設定（設定・フック・スキル・サブエージェント・ルール・メモリ）を読む場所。","プロジェクト直下の .claude/ と、ユーザー共通の ~/.claude/ がある。会話の記録(transcript)は ~/.claude/projects/ 以下。プロジェクトのローカルデータを消すのが claude purge（--dry-runで確認）。","claude purge ~/work/repo --dry-run","settings.json|CLAUDE.md|transcript");

T("claude","settings layers","せってぃんぐれいやーず","settings layers|設定の優先順位|settings precedence|managed settings|managed policy|server-managed settings|組織の管理設定|settings.local.json|設定階層|管理設定|組織設定|managed|強制設定","設定を読む階層。優先度は 管理ポリシー > コマンドライン引数 > ローカル(.claude/settings.local.json) > プロジェクト(.claude/settings.json) > ユーザー(~/.claude/settings.json)。","配列は階層をまたいで結合、単一値は上位が優先。組織管理(managed settings)は管理コンソールや端末のOSパスから配布され、ユーザー・プロジェクト設定では上書きできない。","","settings.json|CLAUDE.md");

T("claude","project trust","ぷろじぇくとらすと","project trust|workspace trust|信頼するか|Do you trust this folder|フォルダを信頼|trust dialog|信頼ダイアログ","リポジトリの設定を読み込む前に出る「このフォルダを信頼しますか」の確認。","信頼するまで、リポジトリが持ち込むプロジェクトの許可ルールやマーケットプレイスなどは保留される。他人のリポジトリを開くときは中身（フックやMCP設定）を確認してから信頼する。","","権限|プロンプトインジェクション|hooks");

T("claude","agentic harness","えーじぇんてぃっくはーねす","agentic harness|harness|ハーネス|エージェントハーネス|agent harness|scaffold|スキャフォールド","LLMを実用的なコーディングエージェントにする、ツール・コンテキスト管理・実行環境の一式。","Claude Codeがハーネス、Claudeがその中のモデル。ハーネスがファイルアクセス、シェル実行、権限制御、メモリ読込、行動を連ねるループを担う。同じモデルでもハーネスが違えば性能も安全性も変わる。","","AIエージェント|エージェントループ|ツール呼び出し");

T("claude","system reminder","しすてむりまいんだー","system reminder|system-reminder|<system-reminder>|システムリマインダー|ハーネスが挿入するメッセージ|additionalContext","ハーネス（Claude Code）が会話に差し込む、Claude向けの補足メッセージ。","CLAUDE.md、出力スタイル、フックが返すadditionalContext、スキル一覧、ファイル変更通知、コミット/PRの署名行などはシステムプロンプトではなくsystem reminderとして渡される。ユーザーが送るものではない。","","システムプロンプト|CLAUDE.md|hooks");

T("claude","turn","たーん","turn|ターン|1ターン|max turns|--max-turns|1往復","ユーザーの入力から、Claudeが（ツール呼び出しを挟みつつ）応答し終えるまでの1区切り。","Stopフックは各ターンの終わりに発火する。--max-turns は非対話実行での最大ターン数。1つのセッションは多数のターンで構成される。","","エージェントループ|セッション|--max-turns");

T("claude","transcript","とらんすくりぷと","transcript|トランスクリプト|会話記録|session transcript|.jsonl|~/.claude/projects|Ctrl+O|transcript viewer|会話ログ","セッションの保存記録（既定は ~/.claude/projects/<project>/<session-id>.jsonl）。","再開(resume)はこのファイルを読み戻して行う。画面上のトランスクリプトビューアは Ctrl+O。ログに秘密情報が残りうるので扱いに注意。","","セッション|/resume|.claude ディレクトリ");

T("claude","dynamic workflows","だいなみっくわーくふろー","workflows|/workflows|dynamic workflows|動的ワークフロー|/deep-research|deep-research|/workflow-authoring|ultracode|ワークフロー(Claude Code)","大量のサブエージェントをスクリプトで組織して走らせる仕組み（/workflows で進捗確認・一時停止・保存）。","/deep-research は、Web検索を並列に広げて出典を突き合わせ、レポートを合成する同梱ワークフロー。ultracode は xhigh 相当の思考でワークフローをClaudeに任せるモード。","/workflows","サブエージェント|verification loop|/goal");

T("claude","Claude Code artifact","くろーどこーどあーてぃふぁくと","Claude artifact|artifact|アーティファクト|Artifacts|/artifacts|claude.ai artifact|公開ページ|Share session output","セッションから claude.ai の非公開URLに公開できる、動くWebページ（レポート・ダッシュボード・図など）。","ターミナルの文字より見やすい成果物を共有できる。同じページは更新（再公開）すると同じURLで置き換わる。共有範囲はプランによる。/artifacts で一覧。","/artifacts","クラウドセッション|Markdown");

T("claude","channel","ちゃんねる","channel|channels|--channels|Telegram|Discord|iMessage|push events|イベントを流し込む|--dangerously-load-development-channels","実行中のセッションに外部イベントを送り込むMCPサーバー（Telegram・Discord・iMessageなど）。","離席中に起きたことにClaudeが反応でき、双方向で返信も可能。リサーチプレビュー機能。","claude --channels plugin:my-notifier@my-marketplace","MCP|Webhook");

T("claude","MCP Tool Search","えむしーぴーつーるさーち","tool search|MCP tool search|ツール検索|deferred tools|ツールスキーマの遅延読み込み","MCPツールの詳細スキーマを必要になるまで読み込まず、コンテキストを節約する仕組み。","起動時はツール名とサーバー指示だけ読み込み、使うときに詳細を取得する。使っていないMCPサーバーが文脈を圧迫しにくくなる。","","MCP|コンテキスト");

T("claude","prompt suggestions","ぷろんぷとさじぇすちょん","prompt suggestions|--prompt-suggestions|次のプロンプト候補|サジェスト|入力候補","各ターンの後に表示される「次に打ちそうな指示」の候補。","Tabで採用できる。非対話のstream-jsonでも --prompt-suggestions で出力できる。","","ショートカットキー|claude -p");
