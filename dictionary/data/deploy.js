/* ===== デプロイ・CI/CD・インフラ ===== */
T("deploy","デプロイ","でぷろい","deploy|deployment|デプロイ|デブロイ|deployする|デプロイする|公開する|本番反映|release|配備","作ったアプリを、ユーザーが使えるサーバー/ホスティング上に載せて動く状態にすること。",
"手元（ローカル）で動くものを、インターネット上で誰でもアクセスできる場所へ反映する作業。VercelやNetlifyなら、GitHubにpushするだけで自動的にビルドして公開される。デプロイ先は「本番環境」「ステージング」「プレビュー」など目的別に分ける。",
`git push origin main      # 連携済みなら自動デプロイが走る
vercel --prod             # CLIで本番デプロイ(例)
netlify deploy --prod`,"本番環境|ステージング環境|プレビューデプロイ|CI/CD|ホスティング|ビルド");

T("deploy","本番環境","ほんばんかんきょう","production|prod|プロダクション|本番|production environment|本番デプロイ|--prod","実際のユーザーが使う、公開中の環境。",
"壊すと実害が出るため、変更は十分にテスト・レビューしてから反映する。開発(development)→ステージング(staging)→本番(production)の順に確かめるのが定石。AIエージェントに本番を直接触らせる際は特に権限を絞る。","","ステージング環境|開発環境|デプロイ|ロールバック");

T("deploy","ステージング環境","すてーじんぐかんきょう","staging|ステージング|staging environment|検証環境|テスト環境|pre-production|プレ本番","本番とほぼ同じ構成で、公開前の最終確認をするための環境。","","","本番環境|開発環境|プレビューデプロイ");

T("deploy","開発環境","かいはつかんきょう","development|dev|local environment|ローカル環境|dev environment|NODE_ENV|NODE_ENV=development|開発サーバー","自分のPCや開発用サーバーで、作りながら動かす環境。","通常は npm run dev のように開発サーバーを立ち上げ、保存すると自動で画面に反映される（ホットリロード）。","npm run dev","本番環境|ステージング|npm run dev");

T("deploy","プレビューデプロイ","ぷれびゅーでぷろい","preview deployment|Preview Deployments|プレビュー環境|PRプレビュー|preview URL|プレビューURL|ブランチデプロイ","Pull Requestやブランチごとに自動で作られる、確認用の一時的な公開サイト。",
"Vercel・Netlify・Cloudflare Pagesなどが、PRを作るたびに専用URLでサイトを公開してくれる。レビュアーが見た目を実際に触って確認できる。","","Pull Request|Vercel|Netlify|デプロイ");

T("deploy","ビルド","びるど","build|npm run build|ビルドする|ビルドエラー|build error|build command|ビルドコマンド|bundle|バンドル|production build","ソースコードを、公開・実行できる形（最適化された成果物）に変換する工程。",
"TypeScript→JavaScriptへの変換、ファイルの結合・圧縮、静的HTMLの生成などを行う。多くのホスティングは「Build Command」と「Output Directory（成果物の置き場）」を設定する。ローカルでビルドが通るか事前に確認すると、デプロイ失敗を減らせる。",
`npm run build
# 成果物は dist/ や .next/ や build/ などに出力される`,"デプロイ|Output Directory|bundler|CI");

T("deploy","Output Directory","あうとぷっとでぃれくとり","出力ディレクトリ|publish directory|公開ディレクトリ|dist|build directory|distフォルダ|out|public","ビルドの成果物が置かれるフォルダ（dist / build / out / .next など）。","ホスティング側の設定で「公開するフォルダ」としてここを指定する。フレームワークによって名前が違う（Viteはdist、Next静的出力はout、など）。","","ビルド|Vercel|Netlify");

T("deploy","CI","しーあい","continuous integration|継続的インテグレーション|継続的統合|シーアイ|CI(継続的インテグレーション)","変更をpushするたびに、自動でビルド・テスト・チェックを走らせる仕組み。",
"「変更が既存のものを壊していないか」を機械的に毎回確認する。GitHub ActionsやCircleCIなどで実現する。PRにチェックマーク（✓/✗）が付くのがCIの結果。","","CD|CI/CD|GitHub Actions|テスト|lint");

T("deploy","CD","しーでぃー","continuous delivery|continuous deployment|継続的デリバリー|継続的デプロイ|継続的デプロイメント|シーディー","CIを通ったコードを、自動で（または承認だけで）デプロイまで進める仕組み。",
"Continuous Delivery は「いつでもデプロイできる状態を保つ（最後は手動承認）」、Continuous Deployment は「テストを通れば自動で本番まで反映」。","","CI|CI/CD|デプロイ");

T("deploy","CI/CD","しーあいしーでぃー","CICD|CI CD|パイプライン|pipeline|CI/CDパイプライン|ci/cd|シーアイシーディー","テストからデプロイまでを自動化する一連の流れ（パイプライン）。",
"push → ビルド → テスト → (承認) → デプロイ、という手順をコード化して自動実行する。人手のミスが減り、リリースを頻繁・安全にできる。","","CI|CD|GitHub Actions|デプロイ");

T("deploy","ロールバック","ろーるばっく","rollback|roll back|切り戻し|ロールバックする|巻き戻し|前のバージョンに戻す","問題のあるリリースを、1つ前の正常な状態に戻すこと。",
"VercelやNetlifyでは過去のデプロイを選んで「Promote / Publish」するだけで即座に戻せる。コード側でのやり直しは git revert。「戻せること」はデプロイの安全性の鍵。","git revert <commit>","revert|デプロイ|カナリアリリース");

T("deploy","ブルーグリーンデプロイ","ぶるーぐりーんでぷろい","blue-green|blue green deployment|ブルーグリーン|無停止デプロイ|zero downtime|ゼロダウンタイム","新旧2つの本番環境を用意し、切り替えるだけでリリースする方式。","新バージョンを「グリーン」側に用意・確認し、問題なければトラフィックを一気に切り替える。問題があれば即「ブルー」に戻せる。","","カナリアリリース|ロールバック");

T("deploy","カナリアリリース","かなりありりーす","canary release|カナリア|canary|段階的リリース|gradual rollout|段階リリース","新バージョンを一部のユーザーにだけ先に出して様子を見る方式。","1%→10%→100%のように徐々に広げ、異常があればすぐ止める。","","ロールバック|feature flag|ブルーグリーンデプロイ");

T("deploy","feature flag","ふぃーちゃーふらぐ","フィーチャーフラグ|feature toggle|フィーチャートグル|機能フラグ|feature flags","コードを入れたまま、設定で機能のオン/オフを切り替える仕組み。","未完成の機能を本番に隠したまま出荷したり、一部ユーザーだけに公開したりできる。","","trunk-based development|カナリアリリース");

T("deploy","ホスティング","ほすてぃんぐ","hosting|ウェブホスティング|web hosting|ホスティングサービス|サーバー","Webサイトやアプリをインターネットに公開するための場所・サービス。","GitHub Pages / Vercel / Netlify / Cloudflare Pages / Firebase Hosting / Render などが代表例。静的サイト向けか、サーバー処理(SSR/API)も動かせるかで選ぶ。","","デプロイ|静的サイト|Vercel|Netlify");

T("deploy","静的サイト","せいてきさいと","static site|静的サイトジェネレーター|SSG|Static Site Generation|static hosting|静的ホスティング|スタティックサイト","サーバー側で処理せず、あらかじめ作ったHTML/CSS/JSをそのまま配信するサイト。","高速・安価・安全。ブログ、ドキュメント、LPに向く。SSGはビルド時にHTMLを生成する方式（Astro, Next.jsのstatic export, Hugo, Jekyllなど）。","","SSR|SPA|GitHub Pages|CDN");

T("deploy","SSR","えすえすあーる","server-side rendering|サーバーサイドレンダリング|SSR|ISR|incremental static regeneration|CSR|client-side rendering|クライアントサイドレンダリング","リクエストのたびにサーバーでHTMLを生成して返す描画方式。","対してCSRはブラウザ側でJSがHTMLを作る方式。SSRは初期表示とSEOに強いが、動かすサーバー（またはServerless関数）が必要。","","SPA|静的サイト|Next.js|Serverless");

T("deploy","SPA","えすぴーえー","single page application|シングルページアプリケーション|シングルページアプリ|spa","ページ遷移せず、JavaScriptで画面を書き換えて動くWebアプリ。","React/Vue等で作られることが多い。ホスティング側で「すべてのURLをindex.htmlに返す(rewrite)」設定が必要なことがある（リロードで404になる原因）。","","SSR|React|404");

T("deploy","CDN","しーでぃーえぬ","content delivery network|コンテンツデリバリーネットワーク|CDN|エッジキャッシュ|edge cache|Cloudflare|CloudFront","世界中のサーバーに内容を複製して、ユーザーの近くから高速に配信する仕組み。","画像やJS/CSSなどの静的ファイルを配信するのが主な用途。更新が反映されないときは「キャッシュのパージ（削除）」が必要なことも。","","キャッシュ|ホスティング|エッジ");

T("deploy","エッジ","えっじ","edge|edge function|Edge Functions|エッジ関数|エッジコンピューティング|edge runtime|Cloudflare Workers|Vercel Edge","ユーザーに近い世界各地の拠点で、コードを実行する仕組み。","低遅延が強み。Cloudflare Workers、Vercel Edge Functions/Middleware などがある。使えるAPIに制限があることが多い。","","CDN|Serverless");

T("deploy","Serverless","さーばーれす","サーバーレス|serverless|Lambda|AWS Lambda|Cloud Functions|Cloud Run|Functions|FaaS|関数","サーバー管理をせず、コード（関数）だけを置いて必要なときだけ動かす方式。","使った分だけ課金、自動スケール。起動直後の遅れ（コールドスタート）や実行時間の制限に注意。Vercel Functions/Netlify Functions/AWS Lambdaなど。","","エッジ|API|ホスティング");

T("deploy","ドメイン","どめいん","domain|ドメイン名|独自ドメイン|custom domain|カスタムドメイン|example.com|サブドメイン|subdomain|apex domain","Webサイトの住所となる名前（例：example.com）。","お名前.com・Cloudflare・Google Domains系などで購入し、DNSでホスティング先に向ける。ホスティング側に「カスタムドメイン」として登録して接続する。","","DNS|SSL/TLS|ホスティング");

T("deploy","DNS","でぃーえぬえす","domain name system|DNSレコード|A record|CNAME|Aレコード|CNAMEレコード|TXT record|TXTレコード|MXレコード|NSレコード|ネームサーバー|nameserver|DNS設定","ドメイン名をIPアドレスなどに変換する仕組み。ドメイン設定の要。","Aレコード=IPv4アドレスへ、CNAME=別のドメイン名へ、TXT=所有確認など、MX=メールの宛先。変更が世界に浸透するまで数分〜48時間ほどかかることがある。","","ドメイン|SSL/TLS|CDN");

T("deploy","SSL/TLS","えすえすえるてぃーえるえす","HTTPS|SSL|TLS|SSL証明書|証明書|certificate|Let's Encrypt|https://|鍵マーク|HTTP","通信を暗号化する仕組み。URLがhttps://で始まるサイトで使われる。","VercelやNetlifyなどは、独自ドメインに証明書(Let's Encrypt等)を自動で発行・更新してくれる。HTTPのままだとブラウザに警告が出る。","","ドメイン|DNS");

T("deploy","環境変数","かんきょうへんすう","environment variable|env var|env|環境変数|NODE_ENV|process.env|import.meta.env|export VAR=|printenv|環境変数を設定","プログラムの外から渡す設定値（APIキー・DB接続先など）。",
"コードに直接書かず、環境ごとに変えたい値を外から渡す。ローカルでは .env ファイル、本番ではホスティング(Vercel等)の設定画面や、GitHubのSecretsに登録する。NEXT_PUBLIC_ や VITE_ で始まる変数はブラウザに公開されるので、秘密を入れてはいけない。",
`# .env
DATABASE_URL=postgres://...
API_KEY=xxxxxxxx

// 使うとき(Node.js)
process.env.API_KEY`,".env|secrets|APIキー|.gitignore");

T("deploy",".env","どっとえんぶ","dotenv|.env.local|.env.example|.env.production|.env.development|envファイル|.envファイル|dotenvファイル","環境変数をまとめて書いておく設定ファイル（Gitには絶対commitしない）。",
".gitignore に .env を必ず追加し、代わりに中身の項目名だけを書いた .env.example をcommitするのが定番。誤ってpushした場合は、該当のキーを即座に無効化・再発行する。AIエージェントに.envを読ませる/出力させることにも注意。","# .gitignore\n.env\n.env.local","環境変数|.gitignore|シークレット|APIキー");

T("deploy","シークレット","しーくれっと","secret|secrets management|シークレット管理|機密情報|credentials|認証情報|credential","APIキー・パスワード・トークンなど、漏れてはいけない情報。",
"コードやGit履歴、チャット・ログに残さない。専用のシークレット管理（GitHub Secrets / Vercel環境変数 / AWS Secrets Manager 等）に入れる。漏れたと分かったら「削除」ではなく「無効化して再発行」が必須（履歴に残るため）。","","環境変数|APIキー|.env|Secret scanning");

T("deploy","Vercel","ばーせる","vercel|vercel.com|Vercel CLI|vercel --prod|vercel dev|vercel deploy|vercel.json|Vercel Functions","Next.jsの開発元が提供する、フロントエンド/フルスタック向けのホスティングサービス。",
"GitHubリポジトリを連携すると、pushのたびに自動でビルド・デプロイされ、PRごとにプレビューURLも発行される。Serverless/Edge関数、環境変数管理、ドメイン設定が画面から行える。",
`npm i -g vercel
vercel login
vercel          # プレビューデプロイ
vercel --prod   # 本番デプロイ`,"Next.js|プレビューデプロイ|環境変数|Netlify");

T("deploy","Netlify","ねとらいふ","netlify|netlify.com|netlify.toml|_redirects|netlify deploy|Netlify CLI|Netlify Functions","静的サイト・Jamstack向けのホスティングサービス。","GitHub連携での自動デプロイ、フォーム受信、サーバーレス関数、リダイレクト設定(_redirects / netlify.toml)などが使える。","netlify deploy --prod","Vercel|静的サイト|プレビューデプロイ");

T("deploy","Cloudflare Pages","くらうどふれあぺーじす","Cloudflare Workers|Workers|Wrangler|wrangler|wrangler deploy|Cloudflare|wrangler.toml|Pages Functions|R2|D1|KV","Cloudflareが提供する、静的サイト/エッジ関数のホスティング。","世界中のエッジで高速配信。wrangler がCLI。D1(SQLite系DB)、KV、R2(オブジェクトストレージ)など周辺サービスも使える。","npm i -g wrangler\nwrangler deploy","CDN|エッジ|Vercel");

T("deploy","Firebase","ふぁいやーべーす","firebase|Firebase Hosting|Firestore|firebase deploy|firebase init|Firebase Auth|Cloud Firestore|Google Firebase","Googleのモバイル/Web向けバックエンド一式（DB・認証・ホスティング等）。","Hosting（静的配信）、Authentication、Firestore（NoSQL DB）、Cloud Functions、Storageなどが使える。","firebase login\nfirebase init\nfirebase deploy","Supabase|認証|ホスティング");

T("deploy","Supabase","すぱべーす","supabase|supabase.com|Supabase CLI|supabase start|supabase db push|Supabase Auth|Row Level Security|RLS|行レベルセキュリティ","PostgreSQLをベースにした、認証・DB・ストレージ等を提供するBaaS（Firebaseの代替として人気）。",
"Auth（認証）、Postgres DB、Storage、Realtime、Edge Functionsを提供。Row Level Security(RLS)でテーブル単位に「誰が何を読み書きできるか」を制御するのが重要（設定漏れは情報漏えいの原因）。","","Firebase|PostgreSQL|認証|環境変数");

T("deploy","Render","れんだー","render.com|Render|Railway|railway|Fly.io|fly.io|flyctl|fly deploy|Heroku|heroku|PaaS","サーバーを自前管理せずアプリを動かせるクラウド(PaaS)。Railway・Fly.io・Herokuなども同分野。","Git連携やDockerfileからデプロイでき、DBも一緒に用意できる。常時動くバックエンドを置きたいときの選択肢。","","ホスティング|Docker|Serverless");

T("deploy","AWS","えーだぶりゅーえす","Amazon Web Services|aws|AWS CLI|aws configure|EC2|S3|CloudFront|RDS|IAM|ECS|Amazon S3|アマゾンウェブサービス","Amazonが提供する世界最大級のクラウドサービス群。","EC2(仮想サーバー)、S3(ファイル保管)、Lambda(関数)、RDS(DB)、CloudFront(CDN)、IAM(権限管理)など。機能が非常に多く、設定ミス（公開設定・権限過多）に注意。","aws configure\naws s3 ls","Serverless|CDN|クラウド");

T("deploy","Google Cloud","ぐーぐるくらうど","GCP|gcloud|Cloud Run|Google Cloud Platform|gcloud auth login|gcloud run deploy|BigQuery|Compute Engine","Googleが提供するクラウドサービス群（GCP）。","Cloud Run（コンテナを簡単にデプロイ）、BigQuery（大規模分析）、Compute Engineなど。gcloud がCLI。","gcloud auth login\ngcloud run deploy","AWS|Docker|Serverless");

T("deploy","Azure","あじゅーる","Microsoft Azure|azure|az login|Azure CLI|Azure App Service|Static Web Apps","Microsoftが提供するクラウドサービス群。","","az login","AWS|Google Cloud");

T("deploy","クラウド","くらうど","cloud|cloud computing|クラウドコンピューティング|IaaS|PaaS|SaaS|オンプレミス|on-premises","インターネット経由で借りて使う、サーバーやサービス群。","IaaS=サーバー等の基盤を借りる、PaaS=アプリを動かす土台を借りる、SaaS=完成したソフトを使う（GmailやNotionなど）。自前設備で運用するのがオンプレミス。","","AWS|ホスティング");

T("deploy","Docker","どっかー","docker|ドッカー|docker run|docker build|docker ps|docker compose|docker pull|docker images|docker exec|docker stop|docker-compose","アプリを「環境ごと」パッケージ化して、どこでも同じように動かせるコンテナ技術。",
"「自分のPCでは動くのに本番では動かない」を防ぐ。Dockerfile（作り方の設計書）からimage（雛形）を作り、それを実行したものがcontainer。AIエージェントを安全に隔離して動かす用途にも使われる。",
`docker build -t myapp .
docker run -p 3000:3000 myapp
docker ps
docker exec -it <container> sh
docker compose up -d`,"Dockerfile|コンテナ|image|docker compose|Kubernetes");

T("deploy","Dockerfile","どっかーふぁいる","dockerfile|FROM|COPY|RUN|CMD|ENTRYPOINT|EXPOSE|WORKDIR|ベースイメージ|base image","Dockerのimageの作り方を書いた設計図のファイル。",
"FROM(元になるimage) → WORKDIR → COPY(ファイル配置) → RUN(ビルド時コマンド) → CMD(起動コマンド) の順に書くのが基本。",
`FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]`,"Docker|image|コンテナ");

T("deploy","コンテナ","こんてな","container|image|イメージ|docker image|コンテナイメージ|コンテナ化|containerize","アプリと必要な環境を1つに隔離してまとめた、軽量な実行単位。","image=雛形（読み取り専用の設計済みパッケージ）、container=imageを起動した実体。VMより軽く、起動が速い。","","Docker|Kubernetes|Dockerfile");

T("deploy","docker compose","どっかーこんぽーず","docker-compose|compose.yaml|docker-compose.yml|docker compose up|docker compose down|compose.yml|docker compose up -d","複数のコンテナ（アプリ+DBなど）をまとめて定義・起動するツール。","compose.yaml に構成を書き、docker compose up -d の1コマンドで全部立ち上がる。ローカル開発環境の構築に便利。","docker compose up -d\ndocker compose logs -f\ndocker compose down","Docker|コンテナ");

T("deploy","Kubernetes","くばーねてぃす","k8s|kubectl|K8s|クーバネティス|クバネティス|Helm|kubectl apply|pod|Pod|Deployment|ingress","大量のコンテナを自動で配置・拡張・復旧するオーケストレーションツール。","大規模運用向けで学習コストは高い。個人開発や小規模サービスでは、まずPaaSやCloud Runで十分なことが多い。","kubectl get pods\nkubectl apply -f deploy.yaml","Docker|コンテナ");

T("deploy","Terraform","てらふぉーむ","IaC|Infrastructure as Code|インフラのコード化|terraform apply|terraform plan|OpenTofu|Pulumi|CloudFormation|インフラストラクチャアズコード","インフラ（サーバーやDBなど）をコードで定義・作成する「Infrastructure as Code」ツール。","手作業の設定を減らし、再現性とレビュー可能性を高める。plan（変更内容の確認）→apply（実行）の順で使う。","terraform init\nterraform plan\nterraform apply","AWS|CI/CD");

T("deploy","ヘルスチェック","へるすちぇっく","health check|healthcheck|/health|/healthz|死活監視|ping|uptime|ヘルスエンドポイント","アプリが正常に動いているかを定期的に確認する仕組み（/health などのURL）。","ロードバランサーやコンテナ基盤が、異常なインスタンスを自動で切り離す判断に使う。","","監視|ログ");

T("deploy","監視","かんし","monitoring|モニタリング|observability|オブザーバビリティ|Sentry|Datadog|Grafana|アラート|alert|エラー監視|APM|可観測性","アプリの状態（エラー・遅さ・落ち）を継続的に見張って、異常時に通知する仕組み。","Sentry（エラー収集）、Datadog・Grafana（メトリクス）などが代表的。","","ログ|ヘルスチェック");

T("deploy","ログ","ろぐ","log|logs|ログ出力|logging|log level|ログレベル|console.log|stack trace|スタックトレース|ログを見る|vercel logs|docker logs","プログラムの動きの記録。不具合調査の最重要情報源。","ログレベル（debug / info / warn / error）で重要度を区別する。AIエージェントにエラーを直させるときは、エラーログ全文（スタックトレース）を渡すと精度が上がる。","docker logs -f <container>\nvercel logs <url>","監視|デバッグ");

T("deploy","マイグレーション","まいぐれーしょん","migration|DB migration|データベースマイグレーション|prisma migrate|migrate|スキーマ変更|db migrate|supabase db push|schema migration","データベースの構造（テーブル定義など）の変更を、手順として記録・適用する仕組み。","変更履歴をファイルでバージョン管理し、環境ごとに同じ順で適用する。本番DBへのマイグレーションは、バックアップと影響確認が必須。","npx prisma migrate dev\nnpx prisma migrate deploy","データベース|Prisma|ORM|デプロイ");

T("deploy","SLA","えすえるえー","service level agreement|SLO|SLI|稼働率|アップタイム|可用性|availability|99.9%","サービスの品質（稼働率など）の約束。","「稼働率99.9%」なら年間約8.8時間の停止まで許容、という意味になる。","","監視");

T("deploy","スケーリング","すけーりんぐ","scaling|scale|スケール|autoscaling|オートスケール|水平スケール|垂直スケール|scale up|scale out","アクセス増に合わせて処理能力を増やすこと。","垂直(scale up)=1台を強化、水平(scale out)=台数を増やす。ServerlessやPaaSは自動で行ってくれる。","","Serverless|Kubernetes");

T("deploy","ロードバランサー","ろーどばらんさー","load balancer|LB|ロードバランサ|負荷分散|ALB|ELB|reverse proxy|リバースプロキシ|nginx|Nginx","アクセスを複数のサーバーに振り分けて、負荷と障害に強くする装置・仕組み。","nginxなどは「リバースプロキシ」としても使われ、外からのリクエストを内部のアプリへ中継する。","","スケーリング|ヘルスチェック");

T("deploy","HTTPステータスコード","えいちてぃーてぃーぴーすてーたすこーど","404|500|502|503|504|HTTPステータスコード|status code|200 OK|301|302|401|403|404 Not Found|500 Internal Server Error|401 Unauthorized|403 Forbidden|ステータスコード","HTTPのステータスコード。404=見つからない、500=サーバー内部エラーなど。",
"2xx=成功(200 OK)、3xx=転送(301/302)、4xx=リクエスト側の問題（400不正/401未認証/403権限なし/404未発見/429回数超過）、5xx=サーバー側の問題（500内部エラー/502・503・504ゲートウェイ/混雑）。SPAをデプロイしてリロードすると404になる場合は、rewrite設定を確認。","","SPA|API|ログ|レート制限");

/* ===== 追加 ===== */
T("deploy","リダイレクトとリライト","りだいれくと","redirect|rewrite|rewrites|redirects|リライト|301 redirect|302 redirect|_redirects|vercel.json rewrites|_headers|netlify.toml redirects|URL転送|SPA 404 対策","URLを別の場所に転送する（redirect）／URLは変えずに別の中身を返す（rewrite）設定。","SPAをデプロイして直接URLを開く・リロードすると404になるときは、「すべてのパスを index.html に rewrite」するのが定番の対処。ホスティングごとに vercel.json / netlify.toml(_redirects) / firebase.json で書く。","# Netlify _redirects\n/*  /index.html  200","SPA|HTTPステータスコード|Netlify|Vercel");
T("deploy","ビルドキャッシュ","びるどきゃっしゅ","build cache|ビルドキャッシュ|依存キャッシュ|cache invalidation|キャッシュ削除して再デプロイ|Clear build cache|redeploy without cache|古い表示のまま","ビルドで使った依存関係・中間生成物を保存して再利用し、デプロイを速くする仕組み。","古いキャッシュが原因で直らないときは、ホスティング側の「キャッシュなしで再デプロイ（Clear build cache）」を試す。","","ビルド|キャッシュ|CI");
T("deploy","リージョン","りーじょん","region|リージョン|ap-northeast-1|us-east-1|東京リージョン|データセンター所在地|latency region|nrt1|iad1","クラウドのサーバーが置かれる地域（東京・米国東部など）。","ユーザーとデータベースに近いほど速い。サーバーレス関数とDBのリージョンが離れていると遅くなる。法令・規約でデータの置き場所が決まる場合もある。","","クラウド|CDN|スケーリング");
T("deploy","localhost","ろーかるほすと","localhost|127.0.0.1|0.0.0.0|ポート|port|ポート番号|localhost:3000|localhost:5173|localhost:8080|http://localhost|ループバック|ホスト名","自分のPC自身を指すアドレス。localhost:3000 のように「ポート番号」で動いているアプリを区別する。","開発サーバーは localhost のポートで待ち受ける。外部（スマホなど）から見るには 0.0.0.0 で待受＋同じLAN内のIP、または一時公開のトンネルを使う。他の人からは見えない。","npm run dev   # → http://localhost:3000","開発環境|ps / kill|トンネル");
T("deploy","トンネル(ngrok等)","とんねる","ngrok|cloudflared|Cloudflare Tunnel|tunnel|localtunnel|トンネル|ローカルを外部公開|webhook テスト|一時公開|tailscale|Tailscale Funnel","手元で動いているアプリを、一時的なURLでインターネットに公開する仕組み（ngrok / Cloudflare Tunnel など）。","Webhookの受信テストやスマホでの確認に便利。公開される範囲に注意し、終わったら止める。認証を付けるのが安全。","ngrok http 3000","localhost|Webhook|ドメイン");
T("deploy","Core Web Vitals","こあうぇぶばいたるず","Core Web Vitals|Lighthouse|LCP|CLS|INP|PageSpeed Insights|ページ速度|パフォーマンス計測|web vitals|TTFB|パフォーマンススコア","Googleが定めるWebの体感品質の指標（LCP=表示速度、INP=反応性、CLS=レイアウトのずれ）。","Lighthouse（Chrome DevTools）やPageSpeed Insightsで計測。画像最適化、不要なJSの削減、CDN活用などで改善する。SEOにも影響。","","CDN|SEO|ビルド");
T("deploy","負荷テスト","ふかてすと","load test|負荷テスト|k6|Locust|JMeter|ストレステスト|stress test|ベンチマーク 負荷|ab|wrk|スパイクテスト","大量のアクセスを模擬して、性能の限界や障害点を調べるテスト。","本番ではなくステージングで実施する（本番で行うとDoS同然）。k6・Locust・JMeter・wrk などのツールを使う。","","スケーリング|ステージング環境|監視");
T("deploy","マルチステージビルド","まるちすてーじびるど","multi-stage build|マルチステージ|.dockerignore|dockerignore|FROM ... AS|Dockerイメージを小さく|distroless|alpine","Dockerfile内でビルド用と実行用の段階を分け、最終イメージを小さく安全にする手法。","ビルドツールを最終イメージに含めない。.dockerignore で node_modules や .env をイメージに入れないことも重要（秘密情報の混入防止）。","FROM node:20 AS build\nRUN npm ci && npm run build\nFROM node:20-alpine\nCOPY --from=build /app/dist ./dist","Dockerfile|Docker|シークレット");
T("deploy","メンテナンスモード","めんてなんすもーど","maintenance mode|メンテナンス画面|503 maintenance|メンテ中|downtime|ダウンタイム|計画停止","サービスを一時停止して「メンテナンス中」を表示する状態。","DBマイグレーションなどで書き込みを止める必要があるときに使う。可能ならブルーグリーンやゼロダウンタイムで避ける。","","マイグレーション|ブルーグリーンデプロイ|HTTPステータスコード");
T("deploy","コールドスタート","こーるどすたーと","cold start|コールドスタート|ウォームアップ|warm|最初のリクエストだけ遅い|provisioned concurrency|keep warm","しばらく使われなかったサーバーレス関数の初回実行が遅くなる現象。","起動準備が必要なため。軽量化、エッジ実行、事前ウォームアップなどで軽減する。","","Serverless|エッジ|スケーリング");
T("deploy","バックアップ","ばっくあっぷ","backup|バックアップ|リストア|restore|PITR|point-in-time recovery|スナップショット|snapshot|3-2-1|データ復旧|DBバックアップ","データを別の場所に複製して、消失・破損に備えること。復元できて初めて意味がある。","定期取得＋実際に復元できるかの確認が重要。本番DBを触る前（マイグレーション・AIへの操作許可の前）にも取る。","","マイグレーション|ロールバック|本番環境");
T("deploy","バージョンの固定","ばーじょんのこてい","pin version|バージョン固定|.nvmrc|engines|runtime version|Node version|NODE_VERSION|python-version|.tool-versions|asdf|mise|volta|Dockerのタグ固定|latest タグ","Node/Pythonなどのランタイムや依存のバージョンを明示して、環境差による不具合を防ぐこと。","「ローカルでは動くがデプロイで失敗」の定番原因は Node のバージョン違い。.nvmrc / engines / ホスティングの設定で揃える。Dockerの latest タグは避ける。","node -v\ncat .nvmrc","Node.js|package.json|ビルド");
