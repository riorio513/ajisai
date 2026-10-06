/* ===== MCP・連携ツール ===== */
T("mcp","MCP","えむしーぴー","Model Context Protocol|モデルコンテキストプロトコル|MCPサーバー|MCP server|mcp server|MCP client|MCPクライアント|MCPとは|mcp","AIと外部ツール・データをつなぐための共通規格（Model Context Protocol）。",
"「AI用のUSB-C」と例えられる。MCPサーバーを追加すると、AIがGitHub・Notion・Google Drive・データベース・ブラウザなどを、統一された方法で操作できる。サーバー側が提供するのは主に ツール(tools)、リソース(resources)、プロンプト(prompts)。接続方式はローカルプロセス(stdio)とリモート(HTTP / SSE)。信頼できないMCPサーバーは危険（プロンプトインジェクションや情報流出）なので、提供元を確認する。",
`# Claude Code に追加
claude mcp add --transport http <名前> <URL>
# Codex は config.toml に [mcp_servers.<名前>] を書く`,"ツール呼び出し|claude mcp add|MCPサーバー追加|config.toml|プロンプトインジェクション");

T("mcp","stdio / HTTP / SSE","えすてぃーでぃーあいおー","stdio|HTTP transport|SSE|Server-Sent Events|Streamable HTTP|transport|トランスポート|ローカルMCP|リモートMCP|--transport|remote MCP|local MCP|接続方式|通信方式","MCPサーバーとの接続方式。stdio＝ローカルでプロセス起動、HTTP/SSE＝URLで接続するリモート。","stdioは npx などでローカルにサーバーを起動して標準入出力で会話する方式。リモートMCPはURLに接続し、OAuthなどで認証することが多い。SSEは古い方式で、新しくはStreamable HTTPが主流。","","MCP|OAuth|npx");

T("mcp",".mcp.json","どっとえむしーぴーじぇいそん","mcp.json|.mcp.json|mcpServers|claude_desktop_config.json|MCP設定ファイル|mcp config|Claude Desktop MCP|mcp設定","MCPサーバーの接続設定を書くJSONファイル。プロジェクトに置いてチームで共有できる。","Claude Codeではプロジェクト直下の .mcp.json、Claude Desktopでは claude_desktop_config.json などに記述する。APIキーを直書きせず環境変数を参照する。","{ \"mcpServers\": { \"fs\": { \"command\": \"npx\", \"args\": [\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"] } } }","MCP|環境変数|claude mcp add");

T("mcp","コネクタ","こねくた","connector|connectors|Connectors|コネクター|Gmail連携|Google Drive連携|Notion連携|Slack連携|外部サービス連携|連携ツール|integrations|インテグレーション|claude.ai connectors","Claudeなどのアプリから外部サービス（Gmail・Drive・Notion・Slackなど）に接続する機能。","MCPを元にした、アカウント連携型の仕組み。使うには各サービスでの認可（OAuth）が必要。付与する権限は最小限にし、不要になったら連携を解除する。","","MCP|OAuth");

T("mcp","OAuth","おーおーす","OAuth|OAuth2|OAuth 2.0|オーオース|認可|authorization|スコープ|scope|トークン認可|Sign in with Google|ソーシャルログイン","パスワードを渡さずに、サービス間で限定的なアクセス許可を与える仕組み。","「Googleでログイン」や「GitHubと連携」のボタンの裏側の仕組み。許可するスコープ（読み取りのみ等）を選べる。認証(誰か)と認可(何をしてよいか)は別。","","認証|Personal Access Token|GitHub App");

T("mcp","認証","にんしょう","authentication|auth|authN|認可|authorization|authZ|ログイン|サインイン|login|sign in|JWT|セッション|session|パスワード|2FA|多要素認証|MFA|passkey|パスキー","「あなたは誰か」を確認すること（認証）。何ができるかを決めるのは認可。","ログイン方式：パスワード、ソーシャルログイン(OAuth)、メールリンク、パスキー、多要素認証(2FA/MFA)。自作せず、Supabase Auth・Firebase Auth・Auth0・NextAuth などの既存サービスを使うのが安全。","","OAuth|JWT|Supabase");

T("mcp","Notion","のーしょん","notion|Notion MCP|Notion API|Notion連携|ノーション|notion.so","ドキュメント・データベース・タスクを一体で管理できるワークスペースアプリ。","MCP/コネクタ経由で、AIがページの検索・作成・更新を行える。仕様書や議事録の保管先として、AIの作業結果を残す用途に便利。","","MCP|コネクタ");

T("mcp","Slack","すらっく","slack|Slack MCP|Slack連携|Slack bot|Slackボット|スラック|Slack App|Slack通知","チーム向けのチャットツール。AIやCIの通知先・指示の入口としてよく連携される。","GitHub通知、デプロイ結果、AIエージェントへの依頼窓口など。Webhookで簡単に通知を送れる。","","Webhook|MCP");

T("mcp","Linear","りにあー","linear|Jira|jira|Asana|Trello|ClickUp|課題管理ツール|プロジェクト管理|タスク管理ツール|issue tracker|チケット管理","Issue/タスク管理ツール（Linear・Jira・Asana・Trelloなど）。","MCPやGitHub連携で、チケットからAIに実装を依頼し、PRと紐づける運用ができる。","","Issue|MCP");

T("mcp","Playwright","ぷれいらいと","playwright|Playwright MCP|puppeteer|Puppeteer|ブラウザ自動操作|ブラウザ自動化|headless browser|ヘッドレスブラウザ|E2Eテスト|Chromium|npx playwright","ブラウザを自動操作するツール。E2Eテストや、AIにWebを操作・確認させる用途で使う。","Playwright MCPを追加すると、AIが実際にブラウザを開いて画面を確認し、動作を検証できる。","npx playwright install\nnpx playwright test","E2Eテスト|MCP|テスト");

T("mcp","Context7","こんてきすとせぶん","context7|Context7 MCP|最新ドキュメント取得|ドキュメントMCP|docs MCP|ライブラリドキュメント","ライブラリの最新ドキュメントをAIに渡すためのMCPサーバー。","AIの学習データが古くても、最新のAPI仕様に沿ったコードを書かせやすくなる。ハルシネーション対策の一例。","","MCP|ハルシネーション");

T("mcp","VS Code","ぶいえすこーど","vscode|VSCode|Visual Studio Code|ブイエスコード|code コマンド|code .|VS Code 拡張機能|extensions|拡張機能","Microsoft製の無料で人気のコードエディタ。","code . で今のフォルダを開ける。拡張機能で言語対応やAI連携（Claude Code / Codex / Copilot）を追加できる。CursorやWindsurfはVS Codeベース。","code .","Cursor|IDE|ターミナル");

T("mcp","IDE","あいでぃーいー","integrated development environment|統合開発環境|エディタ|editor|テキストエディタ|JetBrains|IntelliJ|WebStorm|PyCharm|Vim|Neovim|Zed|Xcode|Android Studio|コードエディタ|code editor","コードを書く・動かす・デバッグする機能をまとめた開発ツール（統合開発環境）。","VS Code、JetBrains系(IntelliJ/WebStorm/PyCharm)、Xcode、Android Studio、Vim/Neovim、Zed など。AIエージェントは多くがIDE連携の拡張を提供する。","","VS Code|Cursor");

T("mcp","npx","えぬぴーえっくす","npx|npx -y|npx create-next-app|npx create-vite|パッケージを一時実行|-y|node package runner","npmパッケージを、インストールせずに一時的に実行するコマンド。","MCPサーバーや create-xxx 系のセットアップコマンドの起動によく使う。-y は「確認プロンプトに自動でyes」。信頼できないパッケージは実行しない（実行＝任意コードの実行）。","npx -y create-next-app@latest","npm|MCP");

T("mcp","Zapier / n8n（自動化ツール）","ざぴあー","Zapier|zapier|n8n|IFTTT|Make|Make.com|ノーコード自動化|自動化ツール|workflow automation|ワークフロー自動化|Power Automate","複数のサービスをノーコードでつなぎ、手順を自動化するツール（Zapier、n8n、Make、IFTTTなど）。","「Gmailに来たらNotionに記録」のような連携を画面操作で作れる。n8nはセルフホスト可能。AI処理を途中に挟めるものも多い。","","Webhook|API|MCP");

T("mcp","Sentry","せんとりー","sentry|Sentry MCP|エラートラッキング|error tracking|エラー収集|クラッシュレポート","アプリのエラーを自動収集・通知するサービス。","MCP連携すると、AIが本番のエラー情報を読んで原因調査・修正を進められる。","","監視|ログ");

T("mcp","Figma","ふぃぐま","figma|Figma MCP|デザインツール|デザインデータ|design to code|Figma to code|デザインからコード","UIデザインツール。MCP連携でデザインをAIに読ませてコード化できる。","","","MCP|UI");

T("mcp","Stripe","すとらいぷ","stripe|Stripe MCP|決済|payments|決済API|PayPal|サブスク課金|webhook 決済|checkout","オンライン決済サービス。","APIキーに「公開鍵(pk_)」と「秘密鍵(sk_)」があり、秘密鍵は絶対にフロントやGitに出さない。テストモードで十分検証してから本番へ。","","APIキー|Webhook|シークレット");

/* ===== 追加 ===== */
T("mcp","MCP resources / prompts","りそーす","MCP resources|MCP prompts|MCP tools|resources|prompts|ツール リソース プロンプト|MCPの3要素|elicitation|Elicitation|サンプリング|sampling|roots|ElicitationResult","MCPサーバーが提供するもの：tools（実行できる操作）、resources（読めるデータ）、prompts（定型指示）。","elicitation はMCPサーバーが実行中にユーザーへ追加入力を求める仕組み。Claude Codeではフックの Elicitation / ElicitationResult で扱える。","","MCP|ツール呼び出し|hooks");
T("mcp","MCPのセキュリティ","えむしーぴーのせきゅりてぃ","MCP security|信頼できないMCP|tool poisoning|ツールポイズニング|rug pull|ラグプル|MCP server 信頼|最小権限 MCP|read-only MCP|managed-mcp.json|MCP allowlist","MCPサーバーを入れる際の安全上の注意。","MCPサーバーは任意のコードを動かし、ツール説明文自体がAIへの指示になる。提供元の確認、必要最小限の権限（読み取り専用トークン等）、バージョン固定、組織なら許可リスト(managed-mcp.json)での管理が基本。","","MCP|プロンプトインジェクション|権限|managed settings");
T("mcp","GitHub MCP","ぎっとはぶえむしーぴー","GitHub MCP server|github-mcp-server|mcp__github|GitHub連携 MCP|PR作成 MCP","AIがGitHubのIssue・PR・コード検索・Actionsを操作できるようにするMCPサーバー。","ghコマンドが使えない環境でも、PR作成やレビュー、CI状況の確認をAIに任せられる。付与するトークンの権限（リポジトリ範囲）は最小限に。","","MCP|GitHub CLI|Pull Request");
T("mcp","Postgres / DB MCP","でーたべーすえむしーぴー","Postgres MCP|database MCP|Supabase MCP|SQL MCP|DB接続 AI|read-only DB|DBをAIに触らせる","データベースをAIに参照・操作させるMCPサーバー。","本番DBへは読み取り専用の接続にし、書き込みはステージングで。破壊的SQL(DROP/DELETE)の実行前に必ず確認する運用にする。","","データベース|MCP|権限|バックアップ");
T("mcp","Docker Desktop / Dev Container","でぶこんてな","dev container|devcontainer|Dev Container|devcontainer.json|Development containers|Docker Desktop|コンテナ開発環境|隔離して開発|Claude Code dev container","開発環境そのものをコンテナで用意する仕組み。AIエージェントを隔離して安全に動かす用途にも使われる。","ネットワーク制限などを組み合わせれば、--dangerously-skip-permissions のような強い権限を使う場合でも被害範囲を限定できる。VS CodeやCodespacesが対応。","","GitHub Codespaces|Docker|サンドボックス|--dangerously-skip-permissions");
T("mcp","Slack/Discord Bot","ぼっと","bot|ボット|Slack bot|Discord bot|Telegram bot|チャットボット|通知bot|Webhook通知|incoming webhook","チャットサービス上で動く自動応答・通知のプログラム。","CI結果やデプロイ通知の送信、AIエージェントへの依頼窓口として使われる。トークン(Bot token)は秘密情報。","","Slack|Webhook|シークレット");
