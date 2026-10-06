/* ===== Git ===== */
T("git","Git","ぎっと","git|ギット|バージョン管理|バージョン管理システム|VCS|version control","ファイルの変更履歴を記録・管理する分散型バージョン管理システム。",
"ソースコードなどの「いつ・誰が・何を変えたか」を記録し、過去の状態に戻したり、複数人・複数のAIエージェントが並行して作業した結果を統合したりできるツール。ローカルPCに履歴をまるごと持つ「分散型」なのが特徴。GitHubはGitリポジトリをクラウドで預かるサービスで、Gitそのものとは別物。",
`git --version
git init
git status`,"リポジトリ|GitHub|commit|branch");

T("git","リポジトリ","りぽじとり","repository|repo|レポジトリ|リポ|Git リポジトリ","ファイルとその変更履歴をまとめて保管する場所（プロジェクト単位の箱）。",
"プロジェクトのファイル一式と、すべての変更履歴を入れておく単位。手元にあるものを「ローカルリポジトリ」、GitHubなど別の場所にあるものを「リモートリポジトリ」と呼ぶ。実体はプロジェクト直下の隠しフォルダ .git に入っている。",
`git init                # 今のフォルダをリポジトリにする
git clone <URL>         # 既存のリポジトリをコピーしてくる`,"clone|git init|ローカル|リモート|.git");

T("git","ローカル","ろーかる","local|ローカルリポジトリ|local repository|手元","自分のPC（や作業環境）の中にあるもの。",
"Gitではローカル＝自分の作業環境にあるリポジトリ・ブランチのこと。commitしただけではローカルにしか記録されず、pushして初めてリモート（GitHubなど）に反映される。","","リモート|push|commit");

T("git","リモート","りもーと","remote|リモートリポジトリ|remote repository|git remote|git remote -v","GitHubなど、ネットワーク上にあるリポジトリ。",
"チームで共有したり、バックアップ・公開したりするためのサーバー側のリポジトリ。ローカルとの対応づけに名前（通常は origin）を付けて管理する。",
`git remote -v                          # 登録済みリモートの一覧
git remote add origin <URL>            # リモートを登録
git remote set-url origin <新しいURL>  # URLを変更`,"origin|push|pull|fetch");

T("git","origin","おりじん","git remote origin|origin/main|origin main","リモートリポジトリにつけられる既定の名前。",
"git clone したときに、元のリポジトリに自動でつく名前。「origin/main」はリモートのmainブランチの最後の状態をローカルに記憶したもの（リモート追跡ブランチ）。名前は変更もできるが、慣習的にoriginを使う。",
`git push origin main
git fetch origin`,"リモート|upstream|リモート追跡ブランチ");

T("git","upstream","あっぷすとりーむ","アップストリーム|git push -u|git push --set-upstream|--set-upstream|set-upstream|-u|上流","「上流」。①ブランチが追跡する相手 ②フォーク元のリポジトリ、の2つの意味で使う。",
"①ローカルブランチに紐づけられたリモートブランチ。設定すると「git push」「git pull」だけで相手を省略できる。②GitHubでforkしたとき、フォーク元（本家）のリポジトリを upstream と呼ぶことが多い。",
`git push -u origin my-branch        # 初回push＋追跡設定
git branch -vv                      # 追跡関係を確認
git remote add upstream <本家URL>   # fork元を登録`,"origin|fork|push");

T("git","clone","くろーん","git clone|クローン|複製|git clone --depth 1|shallow clone|シャロークローン","リモートのリポジトリを丸ごと手元にコピーすること。",
"URLを指定して、ファイルと履歴をすべてダウンロードする。originの登録も自動で行われる。巨大リポジトリは --depth 1 で最新のみ取得する「浅いクローン」が便利。",
`git clone https://github.com/OWNER/REPO.git
git clone git@github.com:OWNER/REPO.git
git clone --depth 1 <URL>   # 履歴を最新1件だけに`,"リポジトリ|fork|git init");

T("git","git init","ぎっとあいにっと","init|git init|イニット|リポジトリ初期化","今のフォルダをGitリポジトリとして初期化するコマンド。",
".git フォルダを作り、このフォルダの管理を開始する。既にあるプロジェクトをGit管理に変えるときや、新規プロジェクトの最初に使う。",
`git init
git init -b main      # 最初のブランチ名をmainに`,"リポジトリ|git clone|.git");

T("git","working tree","わーきんぐつりー","作業ツリー|ワーキングツリー|作業ディレクトリ|working directory|ワーキングディレクトリ|作業フォルダ","今まさに編集しているファイル群（作業ディレクトリ）。",
"Gitの3つの領域の1つめ。①作業ツリー（編集中）→ ②ステージングエリア（次のcommitに入れる予定）→ ③リポジトリ（commit済みの履歴）。git status で各領域の状態がわかる。",
`git status`,"ステージング|git add|commit");

T("git","ステージング","すてーじんぐ","staging|stage|staging area|index|インデックス|ステージ|ステージングエリア|ステージする|git stage","次のcommitに含める変更を「選んで置いておく」場所。",
"作業ツリーの変更のうち、どれを次のcommitに入れるかを選んで置く控え室。git add でステージに載せ、git commit で確定する。これにより関係ない変更を混ぜずに、意味のある単位でcommitできる。",
`git add file.txt      # 特定ファイルを載せる
git restore --staged file.txt   # ステージから外す
git diff --staged     # ステージ内容の差分`,"git add|commit|working tree");

T("git","git add","ぎっとあっど","add|git add .|git add -A|git add -p|git add --all|git add -u|ステージに追加","変更をステージングエリアに載せるコマンド。",
"commitに含めたいファイル・変更を選ぶ。「.」はカレント以下すべて、-A は削除も含めた全変更、-p は変更の一部分だけ対話的に選ぶ。.envなど秘密情報を誤って載せないよう注意。",
`git add src/app.js
git add .           # カレントディレクトリ以下すべて
git add -A          # リポジトリ全体（削除も含む）
git add -p          # 変更の一部だけ選ぶ`,"ステージング|commit|.gitignore");

T("git","commit","こみっと","git commit|コミット|git commit -m|git commit -am|git commit --amend|-m|コミットする","ステージした変更を履歴として記録する操作（セーブポイントを作る）。",
"commitは「ある時点のプロジェクトの状態＋メッセージ」を履歴に残す操作。ローカルにのみ記録され、リモートには push で送る。小さく・意味のまとまりごとに分けると、あとで戻したり原因を探したりしやすい。",
`git commit -m "ログイン画面を追加"
git commit -am "typo修正"      # 追跡済みファイルを一括add+commit
git commit --amend             # 直前のcommitを修正`,"ステージング|コミットメッセージ|amend|push");

T("git","コミットメッセージ","こみっとめっせーじ","commit message|コミットメッセージ|コミットログ","commitに添える「何をなぜ変えたか」の説明文。",
"1行目に要約（50文字程度まで）、空行を挟んで必要なら詳細を書くのが一般的。「何を」より「なぜ」を書くと後で役立つ。AIエージェントにcommitを任せるときも、この書き方を指示しておくと履歴が読みやすくなる。",
`git commit -m "fix: 空の入力で落ちる不具合を修正"`,"commit|Conventional Commits");

T("git","Conventional Commits","こんべんしょなるこみっとす","conventional commit|feat:|fix:|chore:|docs:|refactor:|コンベンショナルコミット|feat|fix|chore","コミットメッセージの書き方の共通ルール（feat: / fix: など接頭辞をつける）。",
"「種別(任意のスコープ): 説明」の形で書く規約。feat=新機能、fix=バグ修正、docs=文書、style=見た目のみ、refactor=整理、test=テスト、chore=雑務、perf=性能、ci=CI設定、build=ビルド。自動でバージョンや変更履歴を生成するツールとも相性がよい。",
`feat(auth): ログインにGoogle認証を追加
fix: 日付の表示がずれる問題を修正
docs: READMEにセットアップ手順を追記`,"コミットメッセージ|semver|リリース");

T("git","push","ぷっしゅ","git push|プッシュ|git push origin main|git push origin|push する|プッシュする","ローカルのcommitをリモートリポジトリに送ること。",
"commitはローカルにしか残らないので、push して初めてGitHub等に反映され、他の人やCI/CDにも届く。送り先が分岐していて拒否されたら、先に pull（または fetch+merge/rebase）で取り込む。",
`git push                       # 追跡先があるとき
git push -u origin my-branch   # 初回（追跡設定つき）
git push origin main`,"pull|リモート|upstream|force push|commit");

T("git","force push","ふぉーすぷっしゅ","git push --force|git push -f|--force|-f|--force-with-lease|force-with-lease|強制push|強制プッシュ","リモートの履歴を、自分のローカルの履歴で強制的に上書きするpush。",
"rebaseやamendで履歴を書き換えた後は、通常のpushが拒否される。そのとき使うのがforce push。ただし他人のcommitを消し飛ばす危険があるため、--force ではなく --force-with-lease（相手が更新していたら中止）を使い、main等の共有ブランチには使わない。AIエージェントには特に慎重に許可を。",
`git push --force-with-lease
# 共有ブランチ(main等)へのforce pushは避ける`,"push|rebase|amend|ブランチ保護");

T("git","pull","ぷる","git pull|プル|git pull origin main|git pull --rebase|pull --rebase","リモートの最新の変更を取得して、今のブランチに取り込むこと（fetch+merge）。",
"git pull は「git fetch」＋「git merge」を一度にやるコマンド。--rebase を付けるとmergeの代わりにrebaseで取り込み、履歴が一直線になる。作業前にpullして最新にしておくのが基本。GitHubの「Pull Request」とは別物。",
`git pull
git pull --rebase
git pull origin main`,"fetch|merge|rebase|Pull Request");

T("git","fetch","ふぇっち","git fetch|フェッチ|git fetch origin|git fetch --all|git fetch --prune","リモートの最新情報をダウンロードする（今のブランチには反映しない）。",
"リモートの変更をローカルに「取り寄せる」だけで、作業ツリーは変わらない。安全に状況確認ができる。取得後に merge / rebase で取り込む。--prune でリモートで削除済みのブランチ情報を整理できる。",
`git fetch origin
git fetch --all --prune
git log HEAD..origin/main   # まだ取り込んでない分`,"pull|origin|merge");

T("git","branch","ぶらんち","git branch|ブランチ|枝|分岐|git branch -a|git branch -d|git branch -D|git branch -m|git branch -vv|ブランチを切る","履歴の枝分かれ。本流に影響を与えず並行して作業するための仕組み。",
"機能追加・バグ修正ごとにブランチを作って作業し、完成したら本流（main）にmerge（またはPull Request）する。Gitのブランチは「commitを指す軽い名札」なので、作成・切替が高速。AIエージェントに複数タスクを任せるときも、タスクごとにブランチを分けると安全。",
`git branch                 # 一覧
git branch feature/login   # 作成
git branch -d feature/login  # 削除（merge済み）
git branch -D feature/login  # 強制削除
git branch -m new-name     # 名前変更`,"checkout|switch|merge|main|feature branch");

T("git","switch","すいっち","git switch|git switch -c|switch -c|ブランチ切り替え|ブランチを切り替える","ブランチを切り替えるコマンド（checkoutの分担版）。",
"ブランチの切替専用の新しいコマンド。-c で新規作成して切り替える。ファイルの復元は restore が担当する。",
`git switch main
git switch -c feature/new-ui   # 作って切替
git switch -                   # 直前のブランチへ`,"checkout|branch|restore");

T("git","checkout","ちぇっくあうと","git checkout|git checkout -b|checkout -b|チェックアウト|git checkout .|git checkout --","ブランチ・commitの切替、またはファイルの復元をする古くからあるコマンド。",
"「ブランチ切替」「新規ブランチ作成(-b)」「ファイルの変更破棄」など複数の役割があり初心者が混乱しやすいため、最近は switch と restore に分けて使うことが推奨される。",
`git checkout main
git checkout -b feature/x
git checkout abc1234        # 特定commitを見る→detached HEAD`,"switch|restore|detached HEAD");

T("git","restore","りすとあ","git restore|git restore --staged|restore --staged|変更を破棄|変更を取り消す|discard changes","作業ツリーやステージの変更を元に戻すコマンド。",
"編集中のファイルを直前のcommit状態に戻したり（変更は消える）、--staged でステージから外したりする。未commitの変更の破棄は元に戻せないので注意。",
`git restore file.txt              # 編集を破棄（戻せない）
git restore --staged file.txt     # ステージから外す
git restore --source=HEAD~2 file.txt  # 2つ前の状態に`,"checkout|reset|stash");

T("git","merge","まーじ","git merge|マージ|git merge --no-ff|git merge --squash|merge commit|マージコミット|--no-ff|マージする","別のブランチの変更を今のブランチに統合すること。",
"例：main にいる状態で git merge feature すると、featureの変更がmainに取り込まれる。履歴が分岐していれば「マージコミット」が作られ、同じ箇所を別々に編集していれば競合（conflict）が起きる。",
`git switch main
git merge feature/login
git merge --no-ff feature/login   # 必ずマージコミットを作る`,"conflict|rebase|fast-forward|squash");

T("git","fast-forward","ふぁーすとふぉわーど","ff|fast forward|ファストフォワード|--ff-only|ff-only","分岐がないとき、ブランチの指す位置を前に進めるだけで済むマージ。",
"mainに新しいcommitがなく、featureがmainの先にあるだけなら、マージコミットを作らずポインタを進めるだけで統合できる。これをfast-forwardという。--ff-only は、fast-forwardできないときは失敗させる指定。",
`git merge --ff-only feature`,"merge|rebase");

T("git","conflict","こんふりくと","コンフリクト|競合|衝突|merge conflict|マージ競合|<<<<<<<|=======|>>>>>>>|CONFLICT|Automatic merge failed","同じ箇所を別々に変更したため、Gitが自動で統合できない状態。",
"ファイル内に <<<<<<< ======= >>>>>>> のマーカーが挿入されるので、どちらを残すか手で編集して整える。直したら git add → git commit（rebase中は git rebase --continue）。やめたいときは --abort。エディタやAIエージェントに解消を手伝わせることも多い。",
`git status                 # 競合ファイルを確認
# マーカーを編集して解消後
git add <file>
git commit                 # (rebase中は git rebase --continue)
git merge --abort          # 取りやめ`,"merge|rebase|Pull Request");

T("git","rebase","りべーす","git rebase|リベース|git rebase -i|rebase -i|git rebase main|git rebase --continue|git rebase --abort|interactive rebase","ブランチの土台（起点）を付け替えて履歴を一直線に整える操作。",
"featureブランチを最新のmainの先頭に「付け替える」ことで、マージコミットなしの綺麗な履歴になる。-i で過去のcommitの並べ替え・統合(squash)・編集もできる。ただし履歴を書き換えるので、共有済みのブランチには使わない（force pushが必要になる）。",
`git rebase main
git rebase -i HEAD~3     # 直近3件を整理
git rebase --continue    # 競合解消後に続行
git rebase --abort       # 中止`,"merge|squash|force push|cherry-pick");

T("git","squash","すくっしゅ","スカッシュ|squash and merge|git merge --squash|fixup|commitをまとめる|コミットをまとめる","複数のcommitを1つにまとめること。",
"作業中の細かいcommitを1つにまとめて履歴を読みやすくする。git rebase -i で squash/fixup を指定するか、GitHubの「Squash and merge」ボタンで行う。",
`git rebase -i HEAD~4    # pick を squash に書き換え`,"rebase|Squash and merge|Pull Request");

T("git","amend","あめんど","git commit --amend|--amend|amend commit|直前のコミットを修正|コミット修正","直前のcommitを作り直して修正すること。",
"commitメッセージの書き間違いや、add忘れのファイル追加を直前のcommitに含めたいときに使う。履歴が書き換わるので、push済みの場合はforce pushが必要になる（共有ブランチでは避ける）。",
`git commit --amend -m "新しいメッセージ"
git add forgot.txt && git commit --amend --no-edit`,"commit|force push");

T("git","reset","りせっと","git reset|git reset --hard|git reset --soft|git reset --mixed|git reset HEAD~1|reset --hard|ハードリセット|リセット","ブランチの位置や、ステージ・作業ツリーを過去の状態に戻す操作。",
"--soft：commitだけ取り消す（変更はステージに残る）、--mixed（既定）：commitとステージを取り消す（変更は作業ツリーに残る）、--hard：作業ツリーの変更まで全部捨てる（未commitの内容は消える。危険）。push済みの履歴には revert を使うのが安全。",
`git reset --soft HEAD~1    # commitを1つ取り消し、変更は残す
git reset --hard HEAD      # 未commitの変更を全部捨てる
git reset --hard origin/main  # リモートの状態に合わせる`,"revert|restore|reflog|HEAD");

T("git","revert","りばーと","git revert|リバート|取り消しコミット|git revert HEAD","指定したcommitを「打ち消す新しいcommit」を作って元に戻す方法。",
"履歴を書き換えず、打ち消しの変更を新たに積むので、push済み・共有済みの変更を取り消すのに安全。reset と違って履歴が残る。",
`git revert HEAD
git revert <commit-hash>`,"reset|commit|rollback");

T("git","stash","すたっしゅ","git stash|スタッシュ|git stash pop|git stash apply|git stash list|git stash -u|退避|一時退避","未commitの変更を一時的に脇に退避しておく機能。",
"作業の途中でブランチを切り替えたいが、commitするほどでもないときに便利。pop で退避した変更を戻す。新規ファイルも退避するなら -u。",
`git stash
git stash -u            # 未追跡ファイルも
git stash list
git stash pop           # 戻して一覧から削除`,"commit|checkout|switch");

T("git","cherry-pick","ちぇりーぴっく","git cherry-pick|チェリーピック|cherry pick","他のブランチの特定のcommitだけを、今のブランチに取り込む操作。",
"ブランチ全体をmergeせず、特定の修正1つだけ（例：本番へのhotfix）を持ってきたいときに使う。同じ内容でも別のcommit（別のハッシュ）として作られる。",
`git cherry-pick abc1234
git cherry-pick A..B     # 範囲指定`,"merge|hotfix|commit hash");

T("git","git log","ぎっとろぐ","log|git log --oneline|git log --graph|git log -p|log --oneline --graph --all|履歴を見る|コミット履歴","commitの履歴を表示するコマンド。",
"誰がいつ何を変えたかを確認する。--oneline で1行表示、--graph でブランチの枝分かれを図示、-p で差分も表示、--author や --since で絞り込める。",
`git log --oneline --graph --all
git log -p file.txt      # ファイルの変更履歴
git log --author="name" --since="1 week ago"`,"commit|git diff|git blame");

T("git","git status","ぎっとすてーたす","status|git status -s|ステータス|変更状況の確認","今のブランチと、変更・ステージ・未追跡ファイルの状態を表示する。",
"迷ったらまず git status。どのブランチにいるか、何が変更されているか、次に何をすべきかのヒントも表示される。",
`git status
git status -s     # 短縮表示`,"working tree|ステージング|git diff");

T("git","git diff","ぎっとでぃふ","diff|git diff --staged|git diff --cached|git diff main|差分|ディフ|git diff HEAD","変更内容（差分）を表示するコマンド。",
"引数なしは「作業ツリー vs ステージ」、--staged は「ステージ vs 最後のcommit」、ブランチ名を渡すとそのブランチとの差分。commit前に必ず目視確認するクセをつけると事故が減る。",
`git diff
git diff --staged
git diff main...feature
git diff --stat       # 概要だけ`,"git status|git log|ステージング");

T("git","git show","ぎっとしょう","show|git show HEAD|git show <hash>","指定したcommitの内容（メッセージと差分）を表示する。","","git show HEAD\ngit show abc1234\ngit show HEAD~2:path/to/file","git log|commit hash");

T("git","git blame","ぎっとぶれーむ","blame|git blame -L|ブレーム|誰が書いたか","ファイルの各行を最後に変更した人・commitを表示する。",
"「この行はいつ、なぜ変更されたのか」を調べる定番。GitHubの画面でもBlame表示がある。","git blame -L 10,20 src/app.js","git log|commit");

T("git","git bisect","ぎっとばいせくと","bisect|git bisect start|二分探索|バグの混入commitを探す","どのcommitでバグが入ったかを二分探索で特定する。",
"正常だったcommit(good)と壊れているcommit(bad)を指定すると、Gitが中間を次々チェックアウトしてくれ、少ない手数で原因commitに到達できる。",
`git bisect start
git bisect bad              # 今は壊れている
git bisect good v1.0        # ここは正常だった
git bisect reset            # 終了`,"git log|revert");

T("git","reflog","りふろぐ","git reflog|reference log|リフログ|誤って消したコミットを戻す","HEADが動いた履歴の記録。reset等で「消えた」commitを救出できる。",
"ブランチを削除したり reset --hard したりしても、reflogを見れば直前のcommitのハッシュが残っていることが多い。そこから git reset や git switch -c で復活できる（ローカルのみ・期限あり）。",
`git reflog
git reset --hard HEAD@{1}`,"reset|HEAD|commit hash");

T("git","HEAD","へっど","HEAD~1|HEAD^|HEAD~2|ヘッド|HEAD~","「今いる場所」を指す特別な名前（通常は現在のブランチの最新commit）。",
"HEAD は現在チェックアウトしているcommitを指す。HEAD~1 は1つ前、HEAD~3 は3つ前のcommit。git show HEAD や git reset HEAD~1 のように使う。","git reset --soft HEAD~1\ngit diff HEAD","detached HEAD|branch|commit hash");

T("git","detached HEAD","でたっちどへっど","デタッチドヘッド|HEAD detached|You are in 'detached HEAD' state|detached head state","ブランチではなく特定のcommitを直接チェックアウトしている状態。",
"過去のcommitを見ているときなどに起きる。この状態でcommitしてもどのブランチにも属さず、切り替えると見失う。残したいなら git switch -c <新ブランチ名> でブランチを作る。",
`git switch -c rescue-branch   # 今の状態に名前をつけて保存
git switch main               # 元のブランチに戻る`,"HEAD|checkout|reflog");

T("git","commit hash","こみっとはっしゅ","SHA|SHA-1|ハッシュ|コミットハッシュ|commit id|コミットID|sha1|ハッシュ値","各commitを一意に識別する40桁の英数字（通常は先頭7桁程度で指定する）。",
"git log で表示される「commit abc1234...」のこと。revert・cherry-pick・checkoutなどでcommitを指定するときに使う。GitHub上のURLにも現れる。",
"git show a1b2c3d","git log|cherry-pick|revert");

T("git","main","めいん","main branch|master|メインブランチ|master branch|デフォルトブランチ|default branch|trunk|トランク","リポジトリの本流となる基準ブランチ（昔は master と呼ばれた）。",
"通常、動作確認済みの安定した状態を保つブランチ。2020年頃からGitHubの既定名が master から main に変わった。直接commitせず、Pull Request経由で変更を入れる運用が一般的。",
`git switch main
git pull`,"branch|Pull Request|ブランチ保護|feature branch");

T("git","feature branch","ふぃーちゃーぶらんち","フィーチャーブランチ|機能ブランチ|トピックブランチ|topic branch|作業ブランチ|feature/","1つの機能・修正のために作る短命のブランチ。",
"main から切って作業し、終わったらPull Request→mergeして削除する。feature/xxx、fix/xxx のように名前に種別をつけると整理しやすい。",
`git switch -c feature/add-search`,"branch|Pull Request|GitHub Flow");

T("git","GitHub Flow","ぎっとはぶふろー","github flow|GitHubフロー|ブランチ戦略|branching strategy","mainから作業ブランチを切り、Pull Requestでレビュー・mergeする、シンプルな開発の流れ。",
"①mainから新ブランチ ②commit ③push ④Pull Request ⑤レビュー・CI ⑥mainへmerge ⑦デプロイ。小〜中規模のチームやAIエージェントとの協業に向く。","","Pull Request|feature branch|Git Flow|trunk-based development");

T("git","Git Flow","ぎっとふろー","gitflow|Gitフロー|develop branch|release branch|hotfix branch","develop・release・hotfix など複数の長寿ブランチを使う、やや重厚なブランチ戦略。",
"main(本番)・develop(開発統合)・feature・release・hotfix を使い分ける。定期リリースの製品向けで、継続デプロイ中心の現代のWebでは GitHub Flow や trunk-based が好まれることも多い。","","GitHub Flow|trunk-based development");

T("git","trunk-based development","とらんくべーすどでべろっぷめんと","トランクベース開発|trunk based|TBD","短命なブランチで頻繁にmainへ統合する開発スタイル。",
"長く生きるブランチを避け、小さな変更を何度もmainへ入れる。フィーチャーフラグと組み合わせて未完成機能を隠すことが多い。CI/CDの考え方と相性が良い。","","feature flag|CI|GitHub Flow");

T("git","hotfix","ほっとふぃっくす","ホットフィックス|緊急修正|hotfix branch","本番で起きた不具合を、通常の手順を待たずに緊急で直す修正。",
"mainから hotfix/xxx ブランチを切り、最小限の修正をPull Requestで素早く本番へ反映する。後で他のブランチにも取り込み忘れないこと。","git switch -c hotfix/login-crash main","本番環境|デプロイ|cherry-pick");

T("git","tag","たぐ","git tag|タグ|git tag -a|git push --tags|git push origin --tags|v1.0.0|リリースタグ","特定のcommitに付ける目印（主にバージョン番号）。",
"v1.2.0 のようにリリース地点へ名前をつける。タグは自動ではpushされないので、git push origin v1.2.0 や --tags で送る。GitHubのReleaseはタグを元に作られる。",
`git tag v1.0.0
git tag -a v1.0.0 -m "初回リリース"
git push origin v1.0.0
git push --tags`,"Release|semver|commit");

T("git","semver","せむばー","セマンティックバージョニング|Semantic Versioning|セムバー|MAJOR.MINOR.PATCH|バージョン番号|1.0.0","「メジャー.マイナー.パッチ」で表す、意味のあるバージョン番号の付け方。",
"例 2.4.1：メジャー(2)＝互換性のない変更、マイナー(4)＝後方互換な機能追加、パッチ(1)＝後方互換なバグ修正。npmのバージョン指定（^1.2.3 / ~1.2.3）もこの考え方に基づく。","","tag|Release|package.json");

T("git","git config","ぎっとこんふぃぐ","config|git config --global|user.name|user.email|git config user.name|git config --list|.gitconfig|gitconfig","Gitの設定を読み書きするコマンド。最初にユーザー名とメールを設定する。",
"commitの作者情報（user.name / user.email）や、エディタ、既定ブランチ名などを設定する。--global はPC全体、省略するとそのリポジトリだけ。設定は ~/.gitconfig や .git/config に保存される。",
`git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --list`,"commit|.git|SSHキー");

T("git","gitignore","ぎっといぐのあ","git ignore|.gitignore|無視ファイル|ignore|gitignore","Gitで管理しないファイル・フォルダを指定する設定ファイル。",
"node_modules、ビルド成果物、.env（秘密情報）、OSの一時ファイルなどをGit管理から除外する。すでにcommit済みのファイルは .gitignore に書いても追跡され続けるので、git rm --cached で外す。",
`# .gitignore の例
node_modules/
.env
dist/
.DS_Store`,"git add|.env|node_modules|シークレット");

T("git","git rm","ぎっとあーるえむ","rm|git rm --cached|git rm -r|git mv|git mv file","ファイルを削除し、その削除をGitに記録する。--cachedで追跡だけ外せる。",
"git rm --cached を使えば、ファイル自体は残したまま「Gitの管理対象から外す」ことができる（.env を誤ってcommitしたときなど）。ただし履歴には残るので、秘密情報は必ず無効化(ローテーション)すること。",
`git rm old.txt
git rm --cached .env
git mv old.txt new.txt     # 名前変更・移動`,".gitignore|シークレット");

T("git","git clean","ぎっとくりーん","clean|git clean -fd|git clean -n|git clean -fdx|未追跡ファイルを削除","Gitで管理していない（未追跡の）ファイルを削除するコマンド。",
"削除すると戻せないため、まず -n（ドライラン）で何が消えるか確認する。-d はフォルダ、-x は .gitignore対象も削除。","git clean -n\ngit clean -fd","git status|.gitignore");

T("git","git worktree","ぎっとわーくつりー","worktree|ワークツリー|git worktree add|複数ブランチ同時作業","1つのリポジトリから、別フォルダに複数ブランチを同時にチェックアウトする機能。",
"ブランチ切替なしに、別ディレクトリで別ブランチの作業ができる。複数のAIエージェントを並列で走らせるとき、互いのファイルを壊さないための隔離手段として人気がある（Claude Codeの--worktreeオプションなど）。",
`git worktree add ../my-feature feature/x
git worktree list
git worktree remove ../my-feature`,"branch|サブエージェント|並列実行");

T("git","git submodule","ぎっとさぶもじゅーる","submodule|サブモジュール|git submodule update --init|--recursive","別のGitリポジトリを、自分のリポジトリの一部として取り込む仕組み。",
"外部ライブラリなどを特定のcommitで固定して含められる。clone時に --recurse-submodules を付けるか、あとで git submodule update --init --recursive を実行する。","git clone --recurse-submodules <URL>","clone|リポジトリ");

T("git","git hook","ぎっとふっく","git hooks|pre-commit|pre-push|commit-msg|husky|フック|.git/hooks|lint-staged","commitやpushなど特定の操作の前後で自動実行されるスクリプト。",
"pre-commit でlint・テストを走らせ、失敗したらcommitを止める、といった自動チェックに使う。huskyやpre-commitなどのツールでチーム共有できる。Claude Codeの「hooks」は別の仕組み（AIの動作に差し込む）。","","hooks|lint|CI");

T("git","git lfs","ぎっとえるえふえす","LFS|Git LFS|large file storage|git lfs track|巨大ファイル","画像・動画・モデルなど巨大ファイルを、Gitリポジトリを重くせずに扱う拡張。",
"実ファイルは別ストレージに置き、リポジトリには参照（ポインタ）だけを入れる。GitHubでは1ファイル100MBを超えるとpushが拒否されるため、そのときの選択肢になる。","git lfs install\ngit lfs track \"*.psd\"","リポジトリ|.gitignore");

T("git","sparse checkout","すぱーすちぇっくあうと","sparse-checkout|スパースチェックアウト|git sparse-checkout","巨大リポジトリの一部のフォルダだけを取り出す機能。","","git sparse-checkout set apps/web","clone|monorepo");

T("git","SSHキー","えすえすえいちきー","SSH key|ssh-keygen|ssh key|SSH鍵|公開鍵|秘密鍵|id_ed25519|git@github.com|ssh -T git@github.com","パスワードの代わりにGitHubなどへ安全に接続するための鍵のペア。",
"公開鍵(.pub)をGitHubに登録し、秘密鍵は自分のPCに置く。これで git@github.com:... 形式のURLで認証できる。秘密鍵は絶対に共有・commitしない。",
`ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub     # これをGitHubに登録
ssh -T git@github.com         # 接続テスト`,"Personal Access Token|clone|git config");

T("git","bare repository","べありぽじとり","ベアリポジトリ|bare|git init --bare|--bare","作業ツリーを持たず、履歴データだけを持つリポジトリ。サーバー側の共有用に使われる。","","git init --bare","リポジトリ|リモート");

T("git","three-way merge","すりーうぇいまーじ","3-way merge|3ウェイマージ|三方向マージ|merge base|共通祖先","共通の祖先と双方の変更を見比べて自動統合するマージ方式。","共通祖先(merge base)・自分・相手の3点を比較し、片方だけが変えた箇所は自動で取り込み、両方が同じ箇所を変えた場合に競合となる。","","merge|conflict");

T("git","リモート追跡ブランチ","りもーとついせきぶらんち","remote-tracking branch|origin/main|remote tracking|tracking branch|追跡ブランチ","リモートの各ブランチの最後に確認した状態を、ローカルに記録した読み取り専用のブランチ。",
"origin/main のような名前。git fetch で更新される。自分では直接commitせず、ローカルの main と比較して「あとどれだけ遅れているか」を知るのに使う。","git branch -r\ngit log main..origin/main","origin|fetch|upstream");
