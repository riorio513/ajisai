/* ===== GitHub ===== */
T("github","GitHub","ぎっとはぶ","github|ギットハブ|github.com|GitHub.com","Gitリポジトリをクラウドで管理し、共同開発を支援するサービス。",
"コードの保管、Pull Requestでのレビュー、Issueでのタスク管理、ActionsによるCI/CD、Pagesでのサイト公開、セキュリティ機能などがまとまったプラットフォーム。Gitは仕組み、GitHubはそれを使ったサービス（類似：GitLab、Bitbucket）。AIエージェントがPRを作る・レビューする場としても中心的。",
"","Git|Pull Request|Issue|GitHub Actions");

T("github","Pull Request","ぷるりくえすと","PR|プルリクエスト|プルリク|pull request|pull-request|プルリクを出す|PRを出す|merge request|MR","「この変更を取り込んでください」とレビューを依頼する仕組み。",
"ブランチをpushしたあと、そのブランチをmainなどへ取り込む提案をするのがPull Request。差分の確認、コメントでのレビュー、CIの自動チェック、承認、mergeまでを1つのページで行う。AIエージェント(Claude Code/Codex等)も、作業結果をPRにして人間のレビューに回すのが基本の流れ。",
`git push -u origin feature/x
gh pr create --fill`,"レビュー|merge|Draft PR|Issue|Squash and merge");

T("github","Draft PR","どらふとぷるりくえすと","ドラフトPR|draft pull request|Draft|ドラフトプルリク|WIP|Ready for review","「まだ作業中」であることを示す下書き状態のPull Request。",
"マージできない状態で作成され、途中経過の共有やCI確認に使える。準備ができたら「Ready for review」にしてレビューを依頼する。","gh pr create --draft","Pull Request|レビュー");

T("github","レビュー","れびゅー","review|code review|コードレビュー|Approve|Request changes|approve|承認|変更依頼|LGTM|Reviewer|レビュワー|レビュアー","Pull Requestの変更を他の人（やAI）が確認し、承認や修正依頼をすること。",
"各行にコメントを付け、最終的に Comment / Approve（承認）/ Request changes（要修正）のいずれかで提出する。LGTM は「Looks Good To Me（問題なし）」の略。ブランチ保護で「N人の承認が必須」と設定できる。","","Pull Request|ブランチ保護|CODEOWNERS");

T("github","Squash and merge","すかっしゅあんどまーじ","squash merge|スカッシュマージ|Merge methods|マージ方法|Rebase and merge|Create a merge commit|merge commit|マージコミット","PRのマージ方法の1つ。PR内の全commitを1つにまとめてmainに入れる。",
"GitHubのマージ方法は3種類。①Create a merge commit（履歴をそのまま残しマージコミットを作る）②Squash and merge（1つのcommitにまとめる＝履歴がすっきり）③Rebase and merge（各commitを一直線に並べる）。チームの方針で既定を決める。","","Pull Request|squash|merge|rebase");

T("github","Issue","いしゅー","issues|イシュー|課題|チケット|issue|Issue番号|#123","バグ報告・要望・タスクを記録して議論するための課題管理機能。",
"1件1件に番号（#123）が付き、ラベル・担当者・マイルストーンで整理できる。PR本文やcommitに「Closes #123」「Fixes #123」と書くと、mergeされたとき自動でIssueが閉じる。AIエージェントに「このIssueを直して」と依頼する使い方も多い。",
`gh issue create --title "ログインできない" --body "再現手順..."
gh issue list`,"Pull Request|ラベル|Closes #|GitHub Projects");

T("github","Closes #","くろーずしゃーぷ","Fixes #|Resolves #|closes|fixes|resolves|Close #123|Fix #123|issueを自動で閉じる|linked issue|キーワード","PRやcommitに書くと、mergeと同時にIssueを自動クローズするキーワード。",
"PR本文に「Closes #123」「Fixes #123」「Resolves #123」などと書くと、デフォルトブランチへmergeされたときにIssue #123が自動で閉じられる。","Closes #123","Issue|Pull Request");

T("github","fork","ふぉーく","フォーク|fork|forking|リポジトリをフォーク","他人のリポジトリを、自分のアカウントにコピーすること。",
"書き込み権限のないOSSに貢献するときの定番。forkして変更し、元のリポジトリへPull Requestを送る。元のリポジトリは upstream と呼ばれ、定期的に同期する。cloneは手元へのコピー、forkはGitHub上でのコピー。","","upstream|Pull Request|clone");

T("github","star","すたー","スター|stars|★|GitHub Star|Watch|ウォッチ|watch","リポジトリをお気に入り登録する機能（Star）／更新通知を受け取る機能（Watch）。","","","GitHub|fork");

T("github","GitHub Actions","ぎっとはぶあくしょんず","Actions|actions|アクション|GitHub Action|ワークフロー|workflow|.github/workflows|workflow.yml|ci.yml","GitHub上でテストやデプロイなどを自動実行する仕組み（CI/CD）。",
"リポジトリの .github/workflows/*.yml に手順を書くと、push・PR・定期実行などをきっかけに仮想マシン（runner）上で自動実行される。テスト、ビルド、デプロイ、AIエージェントの呼び出し（Claude Code Action等）にも使える。",
`# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test`,"CI|runner|workflow_dispatch|secrets|Claude Code GitHub Actions");

T("github","workflow","わーくふろー","ワークフロー|workflow file|workflow yaml|jobs|job|steps|step|uses:|run:|runs-on","GitHub Actionsの自動処理の定義ファイル（YAML）。jobとstepで構成される。",
"1つのworkflowは複数のjob（並列実行の単位）から成り、各jobはstep（コマンドや再利用可能なaction）の連続。on: でトリガー（push, pull_request, schedule, workflow_dispatchなど）を指定する。","","GitHub Actions|runner|workflow_dispatch");

T("github","workflow_dispatch","わーくふろーでぃすぱっち","手動実行|on: workflow_dispatch|schedule|cron|on: push|on: pull_request|トリガー|trigger","GitHub Actionsを手動ボタンで実行できるようにするトリガー。",
"on: に workflow_dispatch を書くと、ActionsタブのRun workflowボタンから実行できる。他に push、pull_request、schedule（cron式で定期実行）、release などのトリガーがある。",
`on:
  workflow_dispatch:
  schedule:
    - cron: "0 0 * * *"   # 毎日 UTC 0:00`,"GitHub Actions|cron");

T("github","runner","らんなー","ランナー|runs-on|ubuntu-latest|self-hosted|self-hosted runner|GitHub-hosted runner|windows-latest|macos-latest","GitHub Actionsのジョブを実際に動かすマシン。",
"GitHubが用意するhosted runner（ubuntu-latest等）と、自分のサーバーで動かす self-hosted runner がある。","runs-on: ubuntu-latest","GitHub Actions|workflow");

T("github","secrets","しーくれっつ","GitHub Secrets|Repository secrets|secrets.|${{ secrets.|Actions secrets|シークレット|Environment secrets","APIキーなどの秘密情報を安全に保管し、Actionsから参照する機能。",
"Settings → Secrets and variables で登録する。ログには自動でマスクされる。コードやcommitに直接書かず、必ずここ（や各サービスのシークレット管理）に入れる。ワークフローでは ${{ secrets.NAME }} で参照。",
`env:
  API_KEY: \${{ secrets.API_KEY }}`,"環境変数|.env|GITHUB_TOKEN|APIキー");

T("github","GITHUB_TOKEN","ぎっとはぶとーくん","github token|automatic token|permissions:|contents: write|自動トークン","GitHub Actions実行時に自動発行される、そのリポジトリ限定の一時トークン。",
"workflow内で secrets.GITHUB_TOKEN として使え、実行終わりに失効する。permissions: で最小限の権限（contents: read など）に絞るのが安全。","permissions:\n  contents: read\n  pull-requests: write","secrets|Personal Access Token|GitHub Actions");

T("github","Personal Access Token","ぱーそなるあくせすとーくん","PAT|パーソナルアクセストークン|アクセストークン|personal access token|fine-grained token|ghp_|github_pat_|classic token","パスワードの代わりにAPI/HTTPSで使う、権限を絞れる個人用の認証トークン。",
"HTTPSでのpushやGitHub APIの認証に使う。「fine-grained」なら対象リポジトリや権限を細かく限定できる（推奨）。漏えいしたらすぐ失効（revoke）する。コードや会話・ログに貼らない。","","SSHキー|GITHUB_TOKEN|APIキー|シークレット");

T("github","GitHub Pages","ぎっとはぶぺーじす","Pages|ページズ|gh-pages|github.io|静的サイトホスティング|GitHub Pagesで公開","GitHubリポジトリの静的サイト（HTML/CSS/JS）を無料で公開できるホスティング。",
"Settings → Pages で公開元ブランチ/フォルダ（またはActions経由）を選ぶと、https://ユーザー名.github.io/リポジトリ名/ で公開される。pushするたび自動更新。サーバー側処理は動かせない。","","デプロイ|静的サイト|GitHub Actions");

T("github","GitHub Codespaces","ぎっとはぶこーどすぺーすす","Codespaces|コードスペース|クラウド開発環境|cloud development environment|devcontainer|dev container|devcontainer.json","ブラウザで開ける、GitHub上のクラウド開発環境。",
"リポジトリごとの開発環境（devcontainer.jsonで定義）を数十秒で用意でき、VS Code相当の画面で開発できる。ローカルPCの環境構築が不要。","","dev container|VS Code|Docker");

T("github","GitHub Projects","ぎっとはぶぷろじぇくつ","Projects|プロジェクトボード|かんばん|カンバン|Kanban|project board","Issue/PRを表やカンバンで管理するプロジェクト管理機能。","","","Issue|Pull Request");

T("github","Release","りりーす","Releases|リリース|GitHub Release|リリースノート|release notes|gh release create|リリースを作る","タグに紐づく、公開用のバージョン配布ページ（変更点とダウンロード物付き）。",
"git tag を元に作る。自動生成のリリースノートに、PRのタイトルが一覧で入る。ビルド成果物（zipなど）を添付して配布もできる。","gh release create v1.0.0 --generate-notes","tag|semver|リリース");

T("github","Discussions","でぃすかっしょんず","GitHub Discussions|ディスカッション","Issueより自由な、質問・雑談・アイデア出し用の掲示板。","","","Issue");

T("github","Wiki","うぃき","GitHub Wiki|wiki|ウィキ","リポジトリに付属する簡易ドキュメント置き場（Markdown）。","","","README");

T("github","README","りーどみー","README.md|readme|リードミー|readme.md","リポジトリのトップに表示される説明書（README.md）。",
"プロジェクトの概要、使い方、セットアップ手順を書く。AIエージェントも最初に読むことが多く、整っているほど作業の質が上がる。Markdownで書く。","","Markdown|CONTRIBUTING|CLAUDE.md|AGENTS.md");

T("github","CONTRIBUTING","こんとりびゅーてぃんぐ","CONTRIBUTING.md|コントリビューションガイド|貢献ガイド|contributing guide|CODE_OF_CONDUCT|行動規範|SECURITY.md","外部の人が貢献するときのルールを書いたファイル（CONTRIBUTING.md）。",
"ブランチ名、コミット規約、テストの流れ、PRの出し方などを書く。CODE_OF_CONDUCT.md（行動規範）、SECURITY.md（脆弱性の報告先）も併せて置くのが定番。","","README|OSS");

T("github","LICENSE","らいせんす","ライセンス|license|MIT License|MIT|Apache-2.0|Apache License|GPL|OSSライセンス|BSD","他人がコードを使っていい条件を示すファイル。",
"LICENSEが無いと、公開していても他人は原則使えない。MIT/Apache-2.0は自由度が高く、GPLは派生物も同じライセンスで公開する必要がある（コピーレフト）。","","OSS|README");

T("github","OSS","おーえすえす","オープンソース|open source|オープンソースソフトウェア|OSS","ソースコードが公開され、決められた条件で誰でも利用・改変・再配布できるソフトウェア。","","","LICENSE|fork|Pull Request");

T("github","Issueテンプレート","いしゅーてんぷれーと","issue template|PR template|pull_request_template.md|PULL_REQUEST_TEMPLATE|ISSUE_TEMPLATE|テンプレート|.github/ISSUE_TEMPLATE","IssueやPRを作るときに最初から入力される定型フォーム。",
".github/ISSUE_TEMPLATE/ や .github/pull_request_template.md に置く。再現手順・期待結果・チェックリストなどを入れておくと、情報が揃いやすい。","","Issue|Pull Request|.github");

T("github","ラベル","らべる","label|labels|good first issue|bug|enhancement|help wanted|ラベル付け","Issue/PRを分類するためのタグ（bug、enhancement、good first issueなど）。","","","Issue|Pull Request");

T("github","マイルストーン","まいるすとーん","milestone|milestones","Issue/PRを「次のリリース」などの目標でまとめる機能。","","","Issue|GitHub Projects");

T("github","メンション","めんしょん","mention|@mention|@claude|@codex|@username|@copilot|@メンション","コメント内で「@ユーザー名」と書いて、その人（やBot・AI）に通知・呼び出しをすること。",
"PRやIssueのコメントで @claude とメンションすると、Claude Code GitHub Actionsが反応して作業する、といったAIエージェント連携にも使われる（設定が必要）。","","Claude Code GitHub Actions|Issue");

T("github","ブランチ保護","ぶらんちほご","branch protection|branch protection rules|rulesets|ルールセット|required status checks|Require a pull request|保護ブランチ|protected branch","mainなど重要なブランチを、直接pushや強制pushから守る設定。",
"Settings → Branches / Rules で設定。「PR必須」「N人の承認」「CI成功必須」「force push禁止」などを強制できる。AIエージェントが誤ってmainを壊す事故も防げる。","","Pull Request|レビュー|CI|force push");

T("github","CODEOWNERS","こーどおーなーず","code owners|コードオーナー|.github/CODEOWNERS","フォルダ・ファイルごとの「責任者」を定め、変更時に自動でレビュー依頼するファイル。","","# .github/CODEOWNERS\n/docs/  @team/docs\n*.js    @alice","レビュー|ブランチ保護");

T("github","auto-merge","おーとまーじ","auto merge|自動マージ|enable auto-merge|Auto-merge","CIとレビューの条件を満たした時点で、PRを自動でmergeする設定。","","gh pr merge --auto --squash","Pull Request|CI|merge queue");

T("github","merge queue","まーじきゅー","マージキュー|merge-queue","複数のPRを順番に最新のmainと合わせてテストしてからmergeする仕組み。","同時にmergeしたPR同士が衝突してmainが壊れるのを防ぐ。大きなチームや大量のAI生成PRがあるリポジトリで特に有効。","","Pull Request|CI|auto-merge");

T("github","Dependabot","でぃぺんだぼっと","dependabot|依存関係の自動更新|dependabot.yml|security updates|Dependabot alerts","依存パッケージの更新・脆弱性を検知して、自動でPRを作ってくれるBot。","","","依存関係|Pull Request|セキュリティ");

T("github","Secret scanning","しーくれっとすきゃにんぐ","secret scanning|シークレットスキャン|push protection|プッシュ保護|code scanning|CodeQL|Code scanning|SAST","コードに混入したAPIキー等を検知・ブロックする機能／脆弱性をコード解析で見つける機能(CodeQL)。","push時にAPIキーらしき文字列を検出するとブロックしてくれる(push protection)。","","secrets|APIキー|Personal Access Token");

T("github","GitHub CLI","ぎっとはぶしーえるあい","gh|gh CLI|gh コマンド|gh pr|gh issue|gh repo|gh auth login|gh pr create|gh pr merge|gh run|ghコマンド","GitHubをターミナルから操作する公式コマンド（gh）。",
"PR作成、Issue確認、Actionsの実行状況、リポジトリ作成などがコマンドでできる。AIエージェントにGitHub作業をさせるときの定番ツール（なお、この環境のようにghが使えず専用ツールを使う場合もある）。",
`gh auth login
gh pr create --fill
gh pr list
gh pr checkout 123
gh pr merge 123 --squash
gh issue create
gh run list
gh repo create`,"Pull Request|Issue|GitHub Actions");

T("github","GitHub App","ぎっとはぶあっぷ","GitHub Apps|OAuth App|OAuth Apps|GitHubアプリ|Claude GitHub App|インストール","GitHubのリポジトリ・組織に権限を与えてインストールできる連携アプリ。",
"アプリごとに「どのリポジトリに、どの権限を」与えるかを細かく選べる。Claude・Codex・Copilot・Vercelなど、多くの連携ツールがGitHub App経由でリポジトリにアクセスする。","","OAuth|Personal Access Token|Claude Code GitHub Actions");

T("github","Webhook","うぇぶふっく","webhook|ウェブフック|ウェブフック|webhooks","出来事（push、PR作成など）が起きたとき、指定URLに自動で通知を送る仕組み。",
"GitHub → あなたのサーバー/サービスへ、HTTPのPOSTで通知する。VercelやNetlifyがpushを検知して自動デプロイするのも、この仕組み（またはGitHub Appのイベント）による。","","API|CI/CD|自動デプロイ");

T("github","Organization","おーがにぜーしょん","org|オーガニゼーション|組織|GitHub Organization|Team|チーム|Collaborator|コラボレーター","複数人・複数リポジトリをまとめて管理するための「組織」アカウント。",
"メンバーの役割（Owner/Member）やチーム単位の権限(Read/Triage/Write/Maintain/Admin)を管理できる。個人リポジトリに他人を招く場合は Collaborator（共同作業者）として追加する。","","権限|CODEOWNERS|ブランチ保護");

T("github","gist","ぎすと","Gist|GitHub Gist|ギスト","コードの断片やメモを手軽に共有できる、小さなGitリポジトリ。","","","GitHub");

T("github","GitHub Copilot","ぎっとはぶこぱいろっと","Copilot|コパイロット|Copilot Chat|Copilot coding agent|Copilot Agent|copilot","GitHubが提供するAIコーディング支援（補完・チャット・エージェント機能）。",
"エディタ上のコード補完・チャットに加え、Issueを割り当てるとPRを作ってくれる「coding agent」機能もある。Claude CodeやCodexと並ぶ選択肢の1つ。","","AIエージェント|Claude Code|Codex");

T("github","GitHub Packages","ぎっとはぶぱっけーじず","Packages|ghcr.io|Container registry|GitHub Container Registry|npm.pkg.github.com","パッケージ（npm・Docker image等）をGitHub上に保管・配布する機能。","","docker pull ghcr.io/OWNER/IMAGE:latest","Docker|npm");

T("github","Actions artifact","あくしょんずあーてぃふぁくと","artifact|アーティファクト|actions/upload-artifact|build artifact|成果物|ビルド成果物|upload-artifact|download-artifact","ビルドやテストの成果物（ファイル）。ActionsのJob間受け渡しや保存に使う。","","uses: actions/upload-artifact@v4","GitHub Actions|ビルド");

T("github","cache","きゃっしゅ","キャッシュ|actions/cache|setup-node cache|cache: npm|依存関係キャッシュ","一度取得・計算した結果を保存して再利用し、処理を速くする仕組み。","Actionsではnode_modulesの取得結果などをキャッシュしてCIを高速化する。ブラウザキャッシュやCDNキャッシュにも同じ考え方が使われる。","","GitHub Actions|CDN");

T("github","matrix","まとりっくす","strategy matrix|matrix strategy|マトリクス|マトリックス","1つのjobを、Nodeのバージョンなど複数の組み合わせで自動的に並列実行する機能。",
"","strategy:\n  matrix:\n    node: [18, 20, 22]","GitHub Actions|workflow");

T("github","Environments","えんばいろんめんつ","environment|GitHub Environments|environment protection|deployment environment|required reviewers","Actions用の「本番」「ステージング」などデプロイ先の区分け。承認者やシークレットを環境ごとに設定できる。","本番デプロイ前に人の承認を必須にする、といった運用ができる。","","本番環境|ステージング|secrets");

T("github","actions/checkout","あくしょんずちぇっくあうと","checkout action|uses: actions/checkout@v4|actions/checkout@v4|actions/setup-node|setup-node","ワークフローでリポジトリのコードを取得するための標準アクション。",
"ほぼすべてのworkflowの最初に置く。runnerは空の状態で起動するので、まずコードを持ってくる必要がある。","- uses: actions/checkout@v4","GitHub Actions|runner");

/* ===== 追加 ===== */
T("github","reusable workflow","りゆーざぶるわーくふろー","workflow_call|reusable workflows|再利用可能ワークフロー|uses: ./.github/workflows|composite action|composite|コンポジットアクション|custom action|カスタムアクション|action.yml","ワークフローや手順を、別のワークフローから呼び出して再利用する仕組み（workflow_call / composite action）。","同じCI手順を複数リポジトリ・複数ワークフローでコピペせずに共有できる。action.yml でJavaScript/Docker/複合アクションを自作もできる。","on:\n  workflow_call:\n    inputs:\n      node-version:\n        type: string","GitHub Actions|workflow");
T("github","needs / if / outputs","にーず","needs:|if:|outputs:|jobs.<id>.needs|条件付き実行|ジョブの依存|job dependencies|always()|failure()|success()|github.ref|github.event_name|steps.<id>.outputs","jobの実行順序や条件を制御する書き方。needsで依存、ifで条件、outputsで値の受け渡し。","needs: build で「buildが成功してから実行」、if: github.ref == 'refs/heads/main' で「mainのときだけ」、if: always() で失敗時も実行。","deploy:\n  needs: build\n  if: github.ref == 'refs/heads/main'","workflow|GitHub Actions|Environments");
T("github","concurrency","こんかれんしー","concurrency:|cancel-in-progress|同時実行制御|二重実行を防ぐ|group:","同じ種類のワークフローが同時に走らないよう制御する設定。","cancel-in-progress: true で、新しいpushが来たら古い実行をキャンセルして無駄とデプロイ衝突を防ぐ。","concurrency:\n  group: deploy-${{ github.ref }}\n  cancel-in-progress: true","GitHub Actions|workflow|デプロイ");
T("github","OIDC","おーあいでぃーしー","OIDC|OpenID Connect|id-token: write|permissions: id-token|クラウドへ鍵なしでログイン|keyless|workload identity|aws-actions/configure-aws-credentials","長期のシークレットを置かず、GitHub Actionsから一時トークンでクラウド(AWS/GCP/Azure)にログインする方式。","permissions に id-token: write を付け、クラウド側で「このリポジトリ・ブランチからの実行を信頼」と設定する。漏れるとまずい固定のアクセスキーを持たずに済む。","permissions:\n  id-token: write\n  contents: read","secrets|AWS|GITHUB_TOKEN");
T("github","アクションのバージョン固定","ばーじょんこてい","pin actions|actions/checkout@<sha>|SHA pinning|uses: owner/repo@sha|サプライチェーン actions|タグ固定|@v4|@main","第三者のActionをタグ（@v4）ではなくコミットSHAで固定して、乗っ取り・改ざんを避ける運用。","タグは付け替えられる可能性がある。公式以外のActionは特にSHA固定とDependabotでの更新が安全。","uses: actions/checkout@<40桁のSHA>","GitHub Actions|Dependabot|依存関係");
T("github","Checks / ステータスチェック","ちぇっくす","status checks|check run|check suite|Checks|Required status checks|required checks|✓|赤いバツ|CIが失敗|commit status|ステータス","PRやcommitに付く、CIなどの自動チェックの結果（成功・失敗・実行中）。","ブランチ保護で「このチェックが成功しないとmerge不可」に設定できる。失敗したらActionsのログ(Details)を開いて原因を確認する。AIエージェントにはこのログを渡して修正させる。","","CI|ブランチ保護|GitHub Actions|auto-merge");
T("github","suggested changes","さじぇすてっどちぇんじ","suggestion|suggested change|```suggestion|変更提案|Commit suggestion|レビューの提案|resolve conversation|Resolve conversation|review thread|レビュースレッド|コメントを解決","レビューコメントで具体的なコード修正案を提示し、ワンクリックで取り込める機能。","コメントに suggestion ブロックを書くと「Commit suggestion」ボタンになる。対応済みのスレッドは Resolve conversation で解決済みにする。","","レビュー|Pull Request");
T("github","GitHub Enterprise","ぎっとはぶえんたーぷらいず","GitHub Enterprise Cloud|GitHub Enterprise Server|GHES|GHEC|GitHub Enterprise|エンタープライズ|SSO|SAML|社内GitHub","企業向けのGitHub。クラウド版(Enterprise Cloud)と自社運用版(Enterprise Server)がある。","SAML SSO、監査ログ、組織ポリシーの強制などが加わる。AIツールの接続先ドメインが github.com とは異なる点に注意。","","Organization|GitHub App");
T("github","dependency graph / SBOM","でぃぺんでんしーぐらふ","dependency graph|SBOM|Software Bill of Materials|ソフトウェア部品表|dependency review|Dependency review|脆弱性アラート|Dependabot alerts","リポジトリが依存するパッケージの一覧と脆弱性を可視化する機能（依存関係グラフ）。","SBOMは使っている部品の一覧表。Dependency reviewは、PRで追加される依存の脆弱性・ライセンスを事前チェックする。","","Dependabot|依存関係|Secret scanning");
T("github","security advisory","せきゅりてぃあどばいざりー","security advisory|GHSA|CVE|脆弱性報告|Private vulnerability reporting|private vulnerability|SECURITY.md|責任ある開示","脆弱性を非公開で報告・修正・公開するための仕組み（GitHub Security Advisories）。","公開Issueに脆弱性を書かず、SECURITY.md に報告窓口を書き、private vulnerability reporting を有効にしておく。CVEは脆弱性の共通ID。","","CONTRIBUTING|Secret scanning|Dependabot");
T("github","GitHub API","ぎっとはぶえーぴーあい","GitHub REST API|GitHub GraphQL|gh api|api.github.com|GraphQL API|GitHub API|octokit|Octokit|Rate limit GitHub|X-RateLimit","GitHubをプログラムから操作するAPI（REST / GraphQL）。gh api コマンドからも呼べる。","認証にはPersonal Access TokenやGitHub Appを使う。回数制限（Rate limit）があり、超えると403/429になる。Octokitは公式SDK。","gh api repos/OWNER/REPO/pulls","GitHub CLI|Personal Access Token|API|GitHub App");
T("github","Pages カスタムドメイン","かすたむどめいん","CNAME file|カスタムドメイン Pages|Enforce HTTPS|GitHub Pages ドメイン|404.html|.nojekyll|Jekyll","GitHub Pagesに独自ドメインを設定する方法（設定画面＋DNSのCNAME/Aレコード）。","公開フォルダの CNAME ファイルにドメイン名を書く。Jekyllの処理を止めたいときは .nojekyll を置く。SPAは404.htmlで index.html へ逃がす手法がある。","","GitHub Pages|DNS|ドメイン");
T("github","Copilot code review","こぱいろっとこーどれびゅー","Copilot review|Copilot code review|request_copilot_review|AIレビュー|自動レビュー bot|レビューBot","GitHub Copilotがpull requestを自動でレビューする機能。","人間のレビューの代わりではなく、一次チェックとして使う。ClaudeやCodexのレビュー連携(@claude / @codex review)も同様の位置づけ。","","GitHub Copilot|レビュー|メンション");
T("github","Issue forms / sub-issues","ふぉーむず","issue forms|issue form|sub-issues|sub issue|サブIssue|Issue form|ISSUE_TEMPLATE/*.yml|tasklist|親子Issue","入力欄が決まったIssueフォーム（YAML定義）と、Issueを親子に分けて管理するサブIssue機能。","大きな作業は親Issueの下にサブIssueとして分割すると、AIエージェントに1件ずつ依頼しやすい。","","Issue|Issueテンプレート|GitHub Projects");
