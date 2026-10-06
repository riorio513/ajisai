/* ===== AIエージェント・LLM ===== */
T("agent","AIエージェント","えーあいえーじぇんと","AI|AI agent|agent|エージェント|AIエージェント|coding agent|コーディングエージェント|agentic|エージェンティック|自律型AI","目標を与えると、自分で計画し、ツールを使い、結果を確認しながら作業を進めるAI。",
"チャットAIが「質問に答える」のに対し、エージェントは「ファイルを読む→コードを書く→コマンドを実行→エラーを見て直す」を自分でループして仕事を終わらせる。Claude Code、Codex、Cursor、GitHub Copilot coding agent などが代表例。便利な反面、権限を与えすぎると事故につながるので、承認・サンドボックス・Git管理が重要。",
"","エージェントループ|ツール呼び出し|サンドボックス|権限|Claude Code|Codex");

T("agent","エージェントループ","えーじぇんとるーぷ","agent loop|agentic loop|ReAct|観察→思考→行動|think act observe|ループ","「考える→ツールを使う→結果を見る」を、終わるまで繰り返す動作の流れ。",
"モデルが次の行動を決め、ファイル読み込みやコマンド実行などのツールを呼び、その結果を受け取ってまた考える。テストが通る、など完了条件を満たすまで回り続ける。回数や費用の上限（max turns / 予算）を設けるのが安全。","","AIエージェント|ツール呼び出し|コンテキスト");

T("agent","LLM","えるえるえむ","large language model|大規模言語モデル|言語モデル|LLM|生成AI|generative AI|foundation model|基盤モデル","大量のテキストで学習した、文章を理解・生成するAIモデル。","Claude・GPT・Gemini・Llama などが該当。「次に来る言葉を予測する」仕組みを大規模にしたもので、コード生成・要約・翻訳・推論ができる。事実と異なることをもっともらしく述べる（ハルシネーション）ことがある。","","ハルシネーション|プロンプト|トークン");

T("agent","プロンプト","ぷろんぷと","prompt|プロンプト|指示文|prompt engineering|プロンプトエンジニアリング|prompting|promptを書く","AIに与える指示・質問の文章。","目的・背景・制約・出力形式・完了条件を具体的に書くほど良い結果になりやすい。例を見せる（few-shot）、段階を分ける、といった工夫をプロンプトエンジニアリングと呼ぶ。","","システムプロンプト|few-shot|コンテキストエンジニアリング");

T("agent","システムプロンプト","しすてむぷろんぷと","system prompt|system message|システムメッセージ|developer message|システム指示|--system-prompt|--append-system-prompt","AIの役割・ルール・口調などを最初に設定する、ユーザーに見えにくい基本指示。","Claude Codeでは CLAUDE.md や --append-system-prompt、CodexではAGENTS.mdなどで、エージェントへの恒常的な指示を追加できる。","claude --append-system-prompt \"常に日本語で回答\"","プロンプト|CLAUDE.md|AGENTS.md");

T("agent","コンテキスト","こんてきすと","context|コンテキスト|文脈|context window|コンテキストウィンドウ|コンテキスト長|context length|コンテキストウインドウ|コンテキスト窓","AIが一度に「覚えて参照できる」情報（会話・読んだファイル・指示）。その上限がコンテキストウィンドウ。",
"会話が長くなり、読み込んだファイルやログが増えるとコンテキストウィンドウが埋まり、古い内容が忘れられたり精度が落ちたりする。Claude Codeでは /context で使用量確認、/compact で要約圧縮、/clear でリセットできる。","/context\n/compact\n/clear","トークン|compact|コンテキストエンジニアリング");

T("agent","トークン","とーくん","token|tokens|トークン数|token count|入力トークン|出力トークン|input tokens|output tokens|トークン課金","AIが文章を処理する最小単位。料金や上限の単位。","日本語は英語より1文字あたりのトークンが多くなりがち。API利用料は「入力トークン数×単価＋出力トークン数×単価」で決まる。※認証用の「アクセストークン」とは別物。","","コンテキスト|API|プロンプトキャッシュ");

T("agent","ハルシネーション","はるしねーしょん","hallucination|幻覚|もっともらしい嘘|でたらめ|捏造|幻覚（AI）","AIが、事実でないことをもっともらしく生成してしまう現象。","存在しない関数・ライブラリ・APIを使うコードを書く、といった形でも起きる。対策：テスト実行、公式ドキュメント参照、出典確認、検索ツールの併用。","","LLM|RAG|テスト");

T("agent","ツール呼び出し","つーるよびだし","tool use|function calling|tool calling|ファンクションコール|関数呼び出し|ツール使用|tools|ツール","AIがテキストを返すだけでなく、外部の機能（ファイル操作・検索・API等）を呼び出す仕組み。","モデルが「このツールをこの引数で呼びたい」と要求し、アプリ側が実行して結果を返す。エージェントの手足にあたる。MCPは、このツールを標準化して接続する規格。","","MCP|AIエージェント|権限");

T("agent","マルチエージェント","まるちえーじぇんと","multi-agent|マルチエージェント|multi agent|複数エージェント|エージェントチーム|並列エージェント|agent team","複数のAIエージェントに役割分担させて協調作業させる方式。","例：調査担当・実装担当・レビュー担当に分ける、独立タスクを並列で走らせる。Claude Codeのサブエージェント、git worktree での隔離などが関連。","","サブエージェント|オーケストレーター|git worktree");

T("agent","オーケストレーター","おーけすとれーたー","orchestrator|orchestration|オーケストレーション|親エージェント|lead agent|supervisor|スーパーバイザー","複数のエージェントを指揮し、タスクの分割・割り当て・結果統合をする役。","","","マルチエージェント|サブエージェント");

T("agent","RAG","らぐ","retrieval augmented generation|検索拡張生成|retrieval-augmented generation|RAG|ラグ|検索拡張","外部の資料を検索して取り出し、その内容を根拠にAIに回答させる方式。","社内文書などをAIの知識に加える代表的な方法。ドキュメントを埋め込み(embedding)化してベクトルDBに保存→質問に近い断片を検索→プロンプトに添えて回答、という流れ。ハルシネーション対策にも有効。","","埋め込み|ベクトルDB|ハルシネーション");

T("agent","埋め込み","うめこみ","embedding|embeddings|エンベディング|ベクトル化|vector|ベクトル|セマンティック検索|semantic search|意味検索","文章を意味の近さを測れる数値の並び（ベクトル）に変換すること。","「意味が近い文章は近い数値になる」ため、キーワードが違っても意味で検索できる。RAGの基盤技術。","","RAG|ベクトルDB");

T("agent","ベクトルDB","べくとるでぃーびー","vector database|vector DB|ベクトルデータベース|pgvector|Pinecone|Chroma|Weaviate|Qdrant","埋め込みベクトルを保存し、類似検索を高速にできるデータベース。","pgvector（PostgreSQL拡張）、Pinecone、Chroma、Qdrantなどが代表的。","","埋め込み|RAG|データベース");

T("agent","ファインチューニング","ふぁいんちゅーにんぐ","fine-tuning|fine tuning|finetune|微調整|追加学習|LoRA|SFT|RLHF","既存モデルに追加データで学習させ、特定の用途・口調に適応させること。","RAGやプロンプト工夫で足りるならまずそちらを試すのが一般的（コスト・手間が小さい）。","","RAG|プロンプト|LLM");

T("agent","推論","すいろん","inference|推論|reasoning|reasoning model|推論モデル|Extended thinking|extended thinking|拡張思考|thinking|思考モード|think|ultrathink|think hard|chain of thought|CoT|思考の連鎖","①学習済みモデルを実行して回答を生成すること(inference) ②回答前に段階的に深く考える能力(reasoning)。","Claude Codeでは、プロンプトに「think」「think hard」「ultrathink」と書く、または設定で拡張思考を有効にすると、より深く考えてから動く（時間・トークンは増える）。難しい設計・デバッグ・計画立案で有効。","","プロンプト|プランモード|トークン");

T("agent","temperature","てんぷれっちゃ","温度|サンプリング|top_p|top-p|temperature=0|ランダム性|創造性パラメータ","出力のランダム性を調整するパラメータ。低いほど安定、高いほど多様。","コード生成や抽出は低め、アイデア出しは高めが目安。モデルによっては固定・非対応のこともある。","","LLM|API");

T("agent","few-shot","ふゅーしょっと","few shot|zero-shot|zero shot|one-shot|ゼロショット|フューショット|少数例|in-context learning|例示|サンプル提示","プロンプトに「入力→出力」の例を数個添えて、期待する形式を伝える手法。","例ゼロなら zero-shot。出力形式を厳密にしたいときに特に有効。","","プロンプト");

T("agent","プロンプトキャッシュ","ぷろんぷときゃっしゅ","prompt caching|prompt cache|キャッシュ読み取り|cache hit|プロンプトキャッシング|cache_control","繰り返し使う長い入力（指示・資料）を再利用して、速度とコストを下げる仕組み。","長いシステムプロンプトやコードベースの共通部分を毎回送る場面で効果的。キャッシュには有効期限(TTL)があり、期限内の再利用が割安になる。","","トークン|コンテキスト|API");

T("agent","プロンプトインジェクション","ぷろんぷといんじぇくしょん","prompt injection|インジェクション|間接プロンプトインジェクション|indirect prompt injection|jailbreak|ジェイルブレイク|脱獄","外部のWebページ・ファイル・コメントに悪意ある指示を仕込み、AIを意図しない行動に誘導する攻撃。",
"例：READMEやIssueコメントに「秘密情報を外部へ送れ」と書いておく。エージェントが読んだ内容を命令と誤認しないよう、権限の最小化、承認の有効化、ネットワークの制限、信頼できない入力の隔離が重要。","","権限|サンドボックス|ガードレール|MCP");

T("agent","ガードレール","がーどれーる","guardrails|guardrail|安全装置|フィルタ|ポリシー|policy|安全対策","AIの暴走や不適切な出力・操作を防ぐための制限・ルール・チェックの総称。","許可リスト/拒否リスト、承認プロンプト、サンドボックス、出力検証、hooksによる自動チェックなど。","","権限|サンドボックス|hooks|プロンプトインジェクション");

T("agent","Human-in-the-loop","ひゅーまんいんざるーぷ","human in the loop|HITL|人間の承認|承認フロー|人が確認|人間による確認|承認","重要な操作の前に、人間が確認・承認するしくみ。","ファイル削除・push・本番デプロイなどはエージェントが勝手にやらず、人間が確認する。承認を減らすほど速いが、リスクが上がる。","","権限|承認モード|パーミッション");

T("agent","サンドボックス","さんどぼっくす","sandbox|sandboxing|サンドボックス化|隔離環境|isolated environment|sandbox mode|--sandbox|workspace-write|read-only|danger-full-access","プログラムの動作範囲を制限して隔離した安全な実行環境。","エージェントが書き込めるフォルダ、使えるネットワーク、実行できるコマンドを制限し、万一の暴走・攻撃でも被害を局所化する。CodexのsandboxモードやClaude Codeのsandboxing機能、Dockerコンテナ等で実現される。","","権限|Codex|承認モード|Docker");

T("agent","権限","けんげん","permission|permissions|パーミッション|許可|allow|deny|ask|アクセス権限|権限設定|最小権限の原則|least privilege","AIや人が「何をしてよいか」の許可範囲。","最小権限の原則：必要最小限だけ許可する。Claude Codeはsettings.jsonのpermissions(allow/ask/deny)とパーミッションモード、Codexは承認ポリシー(approval policy)とsandboxで制御する。","","承認モード|サンドボックス|Human-in-the-loop");

T("agent","承認モード","しょうにんもーど","approval mode|approval policy|承認ポリシー|自動承認|auto-accept|auto approve|自動実行|承認なし","エージェントの操作に、人間の承認をどの程度求めるかの設定。","厳しい順に例：毎回確認 → ファイル編集は自動/コマンドは確認 → すべて自動。Claude Codeはpermission mode、Codexはapproval policy（untrusted / on-request / on-failure / never 等）で設定する。","","権限|Human-in-the-loop|permission mode|approval policy");

T("agent","コンテキストエンジニアリング","こんてきすとえんじにありんぐ","context engineering|コンテキスト設計|文脈設計|文脈管理|context management","AIに「何を・どの順で・どれだけ」見せるかを設計して、性能を引き出す考え方。","良い指示文だけでなく、CLAUDE.md、必要なファイルのみの読み込み、要約(compact)、サブエージェントでの調査分離など、全体の情報設計を指す。","","コンテキスト|CLAUDE.md|サブエージェント|compact");

T("agent","vibe coding","ばいぶこーでぃんぐ","バイブコーディング|vibe-coding|vibecoding|雰囲気コーディング|AI駆動開発|AI-driven development|AIペアプロ|AIペアプログラミング","コードを細かく読まず、AIに自然言語で指示して「雰囲気」でアプリを作っていく開発スタイル。","手軽に作れる反面、品質・セキュリティの確認が甘くなりがち。重要な部分はレビューとテストで担保する。","","AIエージェント|テスト|レビュー");

T("agent","メモリ","めもり","memory|長期記憶|記憶|persistent memory|CLAUDE.md memory|セッション間記憶|memory file","AIが会話をまたいで覚えておく情報（好み・プロジェクトのルール等）。","Claude Codeでは CLAUDE.md が実質的な記憶として毎回読み込まれる。/memory で編集可能。","/memory","CLAUDE.md|コンテキスト");

T("agent","compact","こんぱくと","/compact|compaction|auto-compact|コンパクト|会話の要約|自動圧縮|context compaction|要約圧縮","長くなった会話を要約して、コンテキストを空ける操作。","Claude Codeでは /compact で手動実行でき、上限に近づくと自動でも行われる。/compact に「ここだけ残して」と指示を足すことも可能。細部が失われることがあるので、重要事項はCLAUDE.mdやファイルに書き出しておくと安全。","/compact\n/compact 認証まわりの決定事項を重点的に残して","コンテキスト|/clear|CLAUDE.md");

T("agent","構造化出力","こうぞうかしゅつりょく","structured output|JSON mode|JSON schema|スキーマ出力|response_format|json出力|tool schema","AIの出力を、決まった形式（JSONなど）で受け取る機能。","プログラムから結果を扱うときに必須。スキーマ(JSON Schema)で形を指定する。","","API|JSON");

T("agent","評価","ひょうか","eval|evals|evaluation|LLM-as-a-judge|LLM as judge|ベンチマーク|benchmark|SWE-bench|評価セット|回帰テスト|AI評価","AIの出力品質を測るためのテスト・採点（eval）。","プロンプトやモデルを変えたとき、良くなったか悪くなったかを客観的に確認する。SWE-benchはコーディングエージェントの代表的なベンチマーク。","","LLM|テスト");

T("agent","マルチモーダル","まるちもーだる","multimodal|multi-modal|画像入力|vision|ビジョン|画像認識|画像を読む|スクリーンショットを貼る|image input","テキストだけでなく画像・音声・PDFなど複数の形式を扱えること。","Claude Codeではスクリーンショットを貼り付けて「この画面のように直して」と頼める。","","LLM|Claude Code");

T("agent","Claude","くろーど","claude|Claude モデル|Claude Opus|Claude Sonnet|Claude Haiku|Opus|Sonnet|Haiku|クロード|claude.ai|Anthropic API|Opus 4|Sonnet 4|モデル名","Anthropic社のAIモデル群・サービスの名前。","大きく Opus（最高性能）/ Sonnet（バランス）/ Haiku（高速・低コスト）の系統があり、世代ごとに新モデルが出る。Claude Codeは /model で使うモデルを切り替えられる。最新の一覧は公式ドキュメントで確認。","/model","Anthropic|Claude Code|/model");

T("agent","Anthropic","あんそろぴっく","anthropic|アンスロピック|Anthropic社|console.anthropic.com","Claude・Claude Codeを開発しているAI企業。","","","Claude|Claude Code");

T("agent","OpenAI","おーぷんえーあい","openai|オープンAI|ChatGPT|chatgpt|GPT|GPT-5|GPT-4|o3|o4-mini|gpt-5-codex|チャットGPT","ChatGPT・GPTシリーズ・Codexを開発しているAI企業。","","","Codex|LLM");

T("agent","Gemini","じぇみに","gemini|Gemini CLI|gemini-cli|GEMINI.md|@google/gemini-cli|Google Gemini|ジェミニ|Google AI Studio","Google DeepMindのAIモデル群。コマンドラインのエージェント「Gemini CLI」もある（指示書は GEMINI.md で、CLAUDE.mdに相当）。","","npm install -g @google/gemini-cli\ngemini","Claude Code|Codex|LLM");

T("agent","Cursor","かーそる","cursor|Cursor エディタ|Cursor IDE|カーソル|Windsurf|windsurf|AIエディタ|AI IDE|Cline|Roo Code|Aider|aider","AIエージェント機能を内蔵したコードエディタ。Windsurf・Cline・Aider等も同系統のツール。","VS Codeをベースにした画面で、チャット・自動編集・エージェント実行ができる。ターミナル型(Claude Code/Codex)とエディタ型(Cursor等)があり、併用する人も多い。","","VS Code|Claude Code|Codex");

T("agent","Agent SDK","えーじぇんとえすでぃーけー","Claude Agent SDK|Claude Code SDK|Agents SDK|OpenAI Agents SDK|SDKでエージェントを作る|@anthropic-ai/claude-agent-sdk|claude-agent-sdk","自分のアプリにAIエージェント機能を組み込むための開発キット。","Claude Agent SDKは、Claude Codeと同じエージェントループ・ツール・コンテキスト管理を、PythonやTypeScriptのプログラムから使えるようにしたもの。OpenAIにも Agents SDK がある。","","AIエージェント|SDK|API|Claude Code");

T("agent","A2A","えーつーえー","Agent2Agent|agent2agent|エージェント間通信|agent-to-agent|エージェント連携プロトコル","AIエージェント同士が連携するための通信規格（Agent2Agent）。","MCPが「エージェント⇔ツール」の接続規格なのに対し、A2Aは「エージェント⇔エージェント」の接続規格という位置づけ。","","MCP|マルチエージェント");

T("agent","レート制限","れーとせいげん","rate limit|rate limiting|429|Too Many Requests|使用上限|usage limit|5時間制限|週次制限|quota|クォータ|rate_limit_error","一定時間内に使える回数・量の上限。超えると一時的に使えなくなる(429エラー)。","API・サブスクの両方にあり、一定時間待てば回復する。Claude Codeでは /usage（や /status）で使用状況を確認できる。","","API|トークン|HTTPステータスコード");

T("agent","APIキー","えーぴーあいきー","API key|apikey|API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|sk-|sk-ant-|アクセスキー|キー|認証キー","外部サービスのAPIを使うための、パスワードのような認証用文字列。","漏れると第三者に使われて高額請求などの被害に。コード・Git・チャットに直書きせず環境変数やシークレット管理に入れ、漏れたら即無効化して再発行する。","export ANTHROPIC_API_KEY=\"sk-ant-...\"   # 値は共有しない","環境変数|シークレット|API|.env");

T("agent","Skills","すきるず","skill|スキル|agent skills|エージェントスキル|SKILL.md|.claude/skills|Skill tool|スキルを作る","特定の作業のやり方（手順・スクリプト・資料）をフォルダにまとめ、必要なときだけエージェントが読み込む仕組み。","SKILL.md に「いつ使うか」「どう進めるか」を書き、補助ファイルを同梱する。説明文だけが常時見えていて、必要になった時に本文が読み込まれるため、コンテキストを節約しながら専門知識を追加できる。","# .claude/skills/<name>/SKILL.md\n---\nname: my-skill\ndescription: いつ使うかの説明\n---\n手順...","Claude Code|スラッシュコマンド|コンテキストエンジニアリング");

T("agent","SDK","えすでぃーけー","software development kit|API SDK|ライブラリ|library|クライアントライブラリ|@anthropic-ai/sdk|anthropic SDK|openai SDK","特定サービスのAPIを使いやすくする、公式の開発キット（ライブラリ）。","APIを直接HTTPで叩くより、SDKを使うほうが簡単で型補完も効く。PythonやTypeScriptの公式SDKが多くのサービスで提供される。","pip install anthropic\nnpm install @anthropic-ai/sdk","API|ライブラリ|Agent SDK");

/* ===== 追加 ===== */
T("agent","並列実行","へいれつじっこう","parallel|並列|並列処理|parallel agents|run agents in parallel|同時実行|fan-out|fan out|並行","複数のエージェントやタスクを同時に走らせて、全体の時間を短くすること。","互いに独立したタスク（別ファイル・別調査）に向く。同じファイルを触る作業は衝突しやすいので、git worktree やブランチで分離する。コストも並列数に比例して増える。","","git worktree|サブエージェント|マルチエージェント");
T("agent","context rot","こんてきすとろっと","context rot|コンテキスト劣化|長い会話で精度低下|context decay|lost in the middle|コンテキストが汚れる|context pollution","会話が長くなり、情報が詰め込まれるほど、重要な指示が埋もれて精度が落ちていく現象。","対策：タスクごとに /clear、/compact で要約、ルールはCLAUDE.md/AGENTS.mdへ、調査はサブエージェントに分離、不要なファイルを読ませない。","","コンテキスト|compact|コンテキストエンジニアリング|サブエージェント");
T("agent","workflow と agent","わーくふろーとえーじぇんと","workflow vs agent|ワークフロー型|prompt chaining|プロンプトチェイニング|routing|ルーティング|orchestrator-workers|evaluator-optimizer|parallelization|augmented LLM|エージェントパターン|building effective agents","手順を人が決めて固定するのが「ワークフロー」、AIが自分で手順を決めるのが「エージェント」。","代表パターン：プロンプトチェイニング（段階処理）、ルーティング（振り分け）、並列化、オーケストレーター＋ワーカー、評価者＋改善役（evaluator-optimizer）。確実性が必要ならワークフロー、柔軟性が必要ならエージェントを選ぶ。複雑さは必要になってから足す。","","AIエージェント|オーケストレーター|エージェントループ");
T("agent","spec-driven development","すぺっくどりぶんでべろっぷめんと","spec-driven development|SDD|仕様駆動開発|スペック駆動|spec first|PRD|要件定義 AI|requirements.md|design.md|tasks.md|Kiro|Spec Kit|仕様書を先に書く","先に仕様（要件・設計・タスク分解）を文書化し、それをもとにAIに実装させる開発スタイル。","「雰囲気」で作らせるvibe codingの対極。仕様書を人間がレビューしてから実装に進むので、手戻りと暴走を減らせる。プランモードとも相性が良い。","","vibe coding|プランモード|AGENTS.md");
T("agent","Computer Use","こんぴゅーたーゆーす","computer use|コンピュータ操作|画面操作AI|GUI操作|スクリーンショットで操作|browser use|ブラウザ操作エージェント|operator|computer-use","AIが画面を見て、マウス・キーボードでPCやブラウザを操作する機能。","APIがない業務アプリも操作できるが、遅く誤操作もありうる。プロンプトインジェクション（画面上の文章に操られる）に特に注意し、金銭・認証の操作は人が確認する。","","マルチモーダル|Playwright|プロンプトインジェクション");
T("agent","Batch API","ばっちえーぴーあい","batch API|バッチAPI|Message Batches|非同期一括処理|50%割引|大量処理 API|batch processing","大量のリクエストをまとめて非同期で処理し、料金を抑えるAPI形式。","即時性が不要な大量の分類・要約・評価に向く。結果は一定時間内（例：24時間以内）に返る。","","API|トークン|プロンプトキャッシュ");
T("agent","ストリーミング","すとりーみんぐ","streaming|stream|ストリーム|SSE|Server-Sent Events|token streaming|逐次表示|stream-json|--include-partial-messages","生成された文章を、完成を待たずに少しずつ受け取って表示する方式。","チャットで文字が流れるように出るのがこれ。体感の待ち時間が減る。APIでは stream: true、Claude Codeの非対話では --output-format stream-json。","","API|レイテンシ|claude -p");
T("agent","レイテンシ","れいてんし","latency|TTFT|time to first token|最初のトークンまでの時間|応答時間|遅延|throughput|スループット|tokens per second|tok/s","リクエストから応答が返るまでの遅延。TTFTは最初の1トークンが出るまでの時間。","モデルの大きさ、入力の長さ、ネットワーク、リージョン、キャッシュの有無で変わる。高速モード(/fast)や軽量モデルで改善できる。","","/fast|ストリーミング|トークン");
T("agent","事前学習","じぜんがくしゅう","pretraining|pre-training|事前学習|pretrain|RLHF|人間のフィードバックによる強化学習|alignment|アライメント|HHH|helpful honest harmless|ポストトレーニング|post-training|SFT|distillation|蒸留","LLMを大量の文章で「次の語の予測」として訓練する最初の段階。その後ファインチューニングやRLHFで指示に従うよう調整される。","RLHF＝人間の評価でモデルの振る舞いを好ましい方向に寄せる手法。HHH＝有用・誠実・無害という訓練の枠組み。蒸留＝大きなモデルの知識を小さなモデルへ移す手法。","","LLM|ファインチューニング");
T("agent","オープンウェイトモデル","おーぷんうぇいとももでる","open-weight|open weights|オープンウェイト|ローカルLLM|local LLM|Ollama|ollama|LM Studio|llama.cpp|Llama|Mistral|Qwen|DeepSeek|量子化|quantization|GGUF|オープンソースモデル","重み（モデル本体）が公開されていて、自分のPCやサーバーで動かせるAIモデル。","Ollama・LM Studio・llama.cppで手元実行できる。量子化(精度を少し落として軽量化)でメモリを節約。データを外部に出したくない用途に向くが、性能・運用の手間はクラウドAPIと比較して検討。","ollama run llama3","LLM|API|Gemini");
T("agent","MoE","えむおーいー","MoE|Mixture of Experts|ミクスチャーオブエキスパーツ|専門家混合|疎なモデル|active parameters|パラメータ数","入力ごとに一部の“専門家”だけを動かす構造のモデル。総パラメータが大きくても計算量を抑えられる。","","","LLM|トークン");
T("agent","knowledge cutoff","のれっじかっとおふ","knowledge cutoff|知識カットオフ|学習データの期限|training cutoff|最新情報を知らない|古い情報|cutoff date","モデルが学習した情報の期限。それ以降の出来事やライブラリの最新仕様は知らない。","最新のAPI仕様は、Web検索・公式ドキュメント取得・MCP(Context7など)で補う。古い書き方のコードが出たらこれが原因のことが多い。","","ハルシネーション|Context7|RAG");
T("agent","grounding","ぐらうんでぃんぐ","grounding|グラウンディング|根拠づけ|citation|引用|出典付き回答|ソースを明示|事実確認","回答を、実際の資料・検索結果・コードなどの根拠に結びつけること。","出典を示させる、実際にコマンドを実行して確かめさせる、といった運用でハルシネーションを減らす。","","RAG|ハルシネーション|verification loop");
T("agent","Messages API","めっせーじえーぴーあい","Messages API|/v1/messages|messages.create|Anthropic API|Claude API|Responses API|Chat Completions|chat completions|OpenAI API|API呼び出しの基本","Claude（Anthropic）の中心となるAPI。会話メッセージの配列を送って応答を受け取る。OpenAIには Responses API / Chat Completions がある。","認証はAPIキー（x-api-key ヘッダ）。ツール使用、画像入力、ストリーミング、プロンプトキャッシュ、バッチなどが同じ枠組みで使える。","pip install anthropic","API|APIキー|SDK|トークン");
T("agent","max_tokens","まっくすとーくんず","max_tokens|stop_sequences|stop sequence|max tokens|出力上限|最大出力トークン|途中で切れる|stop_reason|end_turn|max_tokens reached","1回の応答で生成する最大トークン数（出力の上限）。","上限に当たると回答が途中で切れる(stop_reason: max_tokens)。stop sequence は「この文字列が出たら生成を止める」指定。","","トークン|API|コンテキスト");
T("agent","レッドチーミング","れっどちーみんぐ","red teaming|red team|レッドチーム|AI安全性評価|セーフティ|AI safety|jailbreak 試験|adversarial|敵対的テスト","AIを意図的に攻撃・悪用して、弱点や危険な挙動を事前に見つける安全性評価。","プロンプトインジェクション、情報の持ち出し、危険な操作の誘導などを試す。エージェントに強い権限を与える前の確認として有効。","","プロンプトインジェクション|ガードレール|サンドボックス");
T("agent","stateless / stateful","すてーとれす","stateless|stateful|ステートレス|ステートフル|会話履歴はAPI側で保持しない|毎回全履歴を送る|session state","ステートレス＝サーバーが前回の内容を覚えていない／ステートフル＝覚えている。","LLMのAPIは基本ステートレスで、毎回それまでの会話をすべて送り直す。だから会話が長いほどトークンも課金も増える（プロンプトキャッシュで軽減）。","","コンテキスト|トークン|プロンプトキャッシュ");
