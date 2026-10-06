/* ===== Codex（OpenAI） ===== */
/* ※ Codexは更新が速いため、コマンド名・オプション・既定値は公式ドキュメントでの確認を推奨 */
T("codex","Codex","こーでっくす","codex|OpenAI Codex|Codex CLI|codex cli|コーデックス|コデックス|ChatGPT Codex|Codex agent|@openai/codex","OpenAIが提供するコーディングエージェント（CLI・IDE拡張・クラウド・Web）。",
"ターミナルで動く「Codex CLI」、VS Code等の拡張、ChatGPT内のクラウド版Codexなど複数の形態がある。リポジトリを読んでコードを書き、コマンドを実行し、テストで確認する。Claude Codeと同系統のツール。操作範囲は「承認ポリシー」と「サンドボックス」で制御する。",
`npm install -g @openai/codex
codex
codex "このリポジトリの構造を説明して"`,"Codex CLI|AGENTS.md|サンドボックス|承認モード|Claude Code");

T("codex","Codex CLI","こーでっくすしーえるあい","codex cli|codex コマンド|npm i -g @openai/codex|brew install codex|codex login|codex --version|codex --help|codex exec|codex resume|codex mcp","ターミナルで動くCodex。codexコマンドで起動する。",
"主なサブコマンド：codex（対話起動）／codex exec（非対話で1回実行。CI向け）／codex resume（会話再開）／codex login（ログイン）／codex mcp（MCP管理）など。ChatGPTアカウントでのサインインか、APIキーで認証する。",
`codex                          # 対話モード
codex exec "テストを実行して失敗を直して"   # 非対話
codex resume                   # 前回の続き
codex login`,"Codex|codex exec|AGENTS.md|config.toml");

T("codex","codex exec","こーでっくすえぐぜっく","codex exec|exec|非対話モード Codex|codex exec --json|codex exec --full-auto|codex exec resume|スクリプト実行","対話なしで1回の指示を実行して終了するCodexのモード（スクリプト・CI向け）。","結果を標準出力に返し、パイプやGitHub Actionsから呼び出せる。--json でイベントを機械可読な形で出力できる。","codex exec \"READMEの誤字を直して\"\ncodex exec --json \"lintエラーを修正\"","Codex CLI|claude -p|CI");

T("codex","AGENTS.md","えーじぇんつえむでぃー","AGENTS.md|agents.md|AGENTS.override.md|エージェンツエムディー|エージェント指示書|agent instructions|プロジェクト指示書 Codex","AIコーディングエージェントに向けた、プロジェクト共通の指示書（READMEのエージェント版）。",
"ビルド方法・テストコマンド・コーディング規約・注意事項を書いておくと、Codexが作業前に読み込む。特定のツール専用ではなく、複数のエージェント(Codex、Cursor、Copilot等)で共通して読まれる形式として広がっている。Claude Codeでは CLAUDE.md が同じ役割。サブフォルダにも置けて、近い方が優先される。",
`# AGENTS.md の例
## セットアップ
- npm install
## テスト
- npm test を必ず通す
## ルール
- 回答は日本語`,"CLAUDE.md|README|Codex");

T("codex","config.toml","こんふぃぐとむる","config.toml|~/.codex/config.toml|.codex/config.toml|CODEX_HOME|codex config|profiles|[profiles]|[mcp_servers]|model_provider|toml|Codex 設定ファイル","Codexの設定ファイル（~/.codex/config.toml）。モデル、承認ポリシー、サンドボックス、MCP等を設定する。",
"TOML形式。profiles で用途別の設定セットを作り --profile で切り替えられる。[mcp_servers.名前] でMCPサーバーを登録する。コマンドラインの -c key=value で一時的に上書きもできる。",
`# ~/.codex/config.toml（例）
model = "gpt-5-codex"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[mcp_servers.docs]
command = "npx"
args = ["-y", "some-mcp-server"]`,"承認ポリシー|サンドボックスモード|MCP|TOML");

T("codex","承認ポリシー","しょうにんぽりしー","approval policy|approval_policy|--ask-for-approval|-a|untrusted|on-request|on-failure|never|suggest|auto-edit|full-auto|Approval Modes|承認モード Codex|/approvals","Codexが操作の前に人間へ確認を求める条件の設定。",
"代表的な値：untrusted（信頼済みの安全なコマンド以外は確認）／on-request（モデルが必要と判断したとき確認）／on-failure（失敗したときだけ確認）／never（確認しない）。以前は suggest / auto-edit / full-auto の3モード呼称だった（版で変わる）。--ask-for-approval(-a)、config.tomlの approval_policy、実行中は /approvals で変更。",
`codex --ask-for-approval on-request
codex -a untrusted`,"サンドボックスモード|--full-auto|承認モード|権限");

T("codex","サンドボックスモード","さんどぼっくすもーど","sandbox_mode|--sandbox|-s|read-only|workspace-write|danger-full-access|sandbox modes|サンドボックス Codex|ネットワークアクセス|network_access|writable_roots","Codexが触れるファイル・ネットワークの範囲を制限する設定。",
"read-only：読み取りのみ（安全。調査向け）／workspace-write：作業フォルダ内は書き込み可（既定的な選択）／danger-full-access：制限なし（危険）。承認ポリシーと組み合わせて安全性を調整する。ネットワークはデフォルトで制限されることが多い。",
`codex --sandbox read-only
codex -s workspace-write`,"承認ポリシー|サンドボックス|--yolo");

T("codex","--full-auto","ふるおーと","--full-auto|full-auto|フルオート|全自動|低摩擦モード|--ask-for-approval on-request --sandbox workspace-write","「作業フォルダ内の編集・コマンドは自動、危険そうなときだけ確認」という低摩擦の自動実行プリセット。","承認ポリシー(on-request相当)とサンドボックス(workspace-write)の組み合わせの省略形。便利だが、Git管理下の安全な場所で使うこと。","codex --full-auto \"テストが通るまで直して\"","承認ポリシー|サンドボックスモード");

T("codex","--yolo","よーろー","--yolo|yolo|--dangerously-bypass-approvals-and-sandbox|dangerously-bypass-approvals-and-sandbox|承認とサンドボックスを無効化|全部無効|danger","承認もサンドボックスも完全に無効化する、非常に危険なオプション。","Claude Codeの --dangerously-skip-permissions に相当。外部から隔離した使い捨て環境以外では使わない。","codex --dangerously-bypass-approvals-and-sandbox   # 隔離環境のみ","--dangerously-skip-permissions|サンドボックス");

T("codex","Codex スラッシュコマンド","こーでっくすすらっしゅこまんど","/model|/approvals|/new|/init|/status|/diff|/mention|/compact|/review|/resume|/fork|/mcp|/logout|/quit|/exit|/feedback|/prompts|codex slash commands|Codexのスラッシュコマンド","Codex CLIの対話中に使える「/」コマンド。",
"/model＝モデルと推論量の切替／/approvals＝承認設定の変更／/new＝新しい会話／/init＝AGENTS.mdの雛形作成／/status＝現在の設定・使用状況／/diff＝Gitの差分表示／/mention＝ファイルを指定／/compact＝会話の要約／/review＝変更のレビュー／/mcp＝MCPツール一覧。※ 版で増減。/ を入力すると一覧が出る。",
`/model
/approvals
/init
/diff
/compact`,"スラッシュコマンド|AGENTS.md|承認ポリシー");

T("codex","Codex オプション","こーでっくすおぷしょん","--model|-m|--cd|-C|--image|-i|--search|--profile|-p|--config|-c|--oss|--sandbox|--ask-for-approval|--full-auto|--add-dir|codex --help|フラグ Codex|Codex フラグ","codexコマンドの主なオプション。",
"-m/--model＝モデル指定／-C/--cd＝作業ディレクトリ／-i/--image＝画像を添付／--search＝Web検索を有効化／--profile＝設定プロファイル／-c key=value＝設定の一時上書き／-s/--sandbox＝サンドボックス／-a/--ask-for-approval＝承認ポリシー／--add-dir＝書き込み可能フォルダを追加。※ 版により変わるので codex --help が正。",
`codex -m gpt-5-codex -C ./app
codex -i screenshot.png "この画面の崩れを直して"
codex -c model_reasoning_effort=high`,"Codex CLI|承認ポリシー|サンドボックスモード");

T("codex","Codex Cloud","こーでっくすくらうど","codex cloud|Codex Web|Codex クラウド|chatgpt.com/codex|クラウドタスク|cloud tasks|codex cloud exec|Codex environments|Codex 環境","クラウド上の隔離環境でCodexにタスクを実行させ、結果をPRにできる機能。","GitHubリポジトリを連携すると、クラウドのコンテナで並列にタスクを実行し、差分をレビュー→PR作成までできる。環境（依存インストール・セットアップスクリプト・ネットワーク設定）をリポジトリごとに用意する。","","Codex|Claude Code on the web|サンドボックス");

T("codex","Codex IDE拡張","こーでっくすあいでぃーいーかくちょう","Codex extension|Codex VS Code|Codex IDE extension|VS Code Codex|Cursor Codex|Codex拡張機能|openai.chatgpt","VS Code系エディタ上でCodexを使うための拡張機能。","エディタ内のサイドパネルでチャットし、開いているファイルや選択範囲をコンテキストにして編集依頼ができる。","","Codex|VS Code");

T("codex","Codex GitHub連携","こーでっくすぎっとはぶれんけい","@codex|@codex review|Codex code review|Codex GitHub integration|Codexレビュー|自動レビュー|Codex PR","GitHubのPRで @codex をメンションしてレビューや修正を頼める連携。","リポジトリでCodexのレビューを有効にしておくと、PRに自動でレビューコメントを付けたり、コメントで依頼したタスクを実行してくれる。","@codex review","メンション|Pull Request|Codex Cloud");

T("codex","reasoning effort","りーぞにんぐえふぉーと","model_reasoning_effort|reasoning_effort|reasoning effort|推論の強さ|思考量|low|medium|high|minimal|reasoning.effort","モデルがどれだけ時間をかけて考えるかの度合い（minimal / low / medium / high）。","高いほど複雑な問題に強いが、遅くコストも増える。Codexでは /model か設定 model_reasoning_effort で調整する。","codex -c model_reasoning_effort=high","推論|Codex");
