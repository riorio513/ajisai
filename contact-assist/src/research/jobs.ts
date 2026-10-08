/** 採用職種の調査: Excelの職種候補と、採用ページ等の文章を機械的に突き合わせる（AI前のルール判定） */
export interface JobCandidate {
  id: string;
  label: string;
}
export interface EvidenceDoc {
  kind: string; // '採用ページ' | '公式サイト' | '事業内容'
  url: string;
  text: string;
}
export interface JobScore {
  id: string;
  label: string;
  score: number;
  hits: string[];
}

/** 職種名の言い換え。候補ラベルの語から、本文で探す語を広げるためだけに使う（新しい職種は作らない） */
const SYNONYMS: Record<string, string[]> = {
  ドライバー: ['運転手', '配送', '乗務員', '運行', 'ドライバ', '運転'],
  運転: ['ドライバー', '運転手', '乗務員'],
  配送: ['ドライバー', '配達', 'デリバリー'],
  物流: ['倉庫', '配送', '運送', 'ロジスティクス', '運輸'],
  運輸: ['運送', '物流', '輸送'],
  エンジニア: ['SE', 'システム開発', 'プログラマ', '開発職', '技術職', 'ITエンジニア', 'インフラ', 'ソフトウェア'],
  IT: ['システム', 'エンジニア', 'ソフトウェア', 'Web'],
  営業: ['営業職', '法人営業', 'セールス', '営業担当', 'ルートセールス'],
  介護: ['介護職', 'ヘルパー', '介護福祉士', '介護スタッフ', 'ケアマネ', '看護助手', '訪問介護'],
  福祉: ['介護', '支援員', '生活相談員', '障害', '福祉'],
  看護: ['看護師', '准看護師', 'ナース'],
  医療: ['医師', '薬剤師', '歯科', '看護', '医療事務', '放射線'],
  事務: ['一般事務', '営業事務', '経理', '総務', '人事', '事務職', '受付'],
  製造: ['工場', 'ライン', '製造スタッフ', 'オペレーター', '組立', '加工', '検査', '生産'],
  工場: ['製造', 'ライン', '生産', '軽作業'],
  販売: ['接客', '店舗スタッフ', '販売スタッフ', 'ショップ', '店員'],
  飲食: ['調理', 'ホール', 'キッチン', '厨房', 'フロア', 'ホールスタッフ'],
  建設: ['施工管理', '現場作業', '土木', '建築', '職人', '電気工事', '設備', '現場'],
  保育: ['保育士', '幼稚園教諭', '保育補助'],
  清掃: ['ビルメンテナンス', 'クリーニング', '清掃スタッフ', 'ビルメン'],
  警備: ['警備員', '施設警備', '交通誘導', 'ガードマン'],
  美容: ['美容師', 'エステ', 'ネイル', '理容師', 'スタイリスト'],
  ホテル: ['宿泊', 'フロント', '客室', 'ホテルスタッフ'],
  設計: ['CAD', '設計職', 'デザイナー'],
  講師: ['教師', '教員', '塾講師', 'インストラクター'],
  コールセンター: ['オペレーター', 'テレフォン', 'カスタマー', 'サポート'],
  介護職: ['ヘルパー', '介護福祉士'],
};

function tokensOf(label: string): string[] {
  const parts = label.normalize('NFKC').split(/[・／/（）()、,，\s&＆+＋\-－]+/).map((s) => s.trim()).filter((s) => s.length >= 2);
  return [...new Set([label.normalize('NFKC').replace(/\s+/g, ''), ...parts])];
}

function expand(token: string): string[] {
  const out = new Set<string>([token]);
  for (const [k, syn] of Object.entries(SYNONYMS)) {
    if (token.includes(k) || k.includes(token)) syn.forEach((s) => out.add(s));
  }
  return [...out];
}

const WEIGHT: Record<string, number> = { 採用ページ: 3, 公式サイト: 1.5, 事業内容: 1 };

function countOf(text: string, term: string): number {
  const t = term.toLowerCase();
  const hay = text.normalize('NFKC').toLowerCase();
  let n = 0;
  let i = 0;
  while ((i = hay.indexOf(t, i)) !== -1) {
    n++;
    i += t.length;
    if (n >= 20) break;
  }
  return n;
}

export function scoreJobs(docs: EvidenceDoc[], jobs: JobCandidate[]): JobScore[] {
  return jobs
    .map((job) => {
      let score = 0;
      const hits = new Set<string>();
      const tokens = tokensOf(job.label);
      for (const doc of docs) {
        const w = WEIGHT[doc.kind] ?? 1;
        for (const token of tokens) {
          const isFull = token === job.label.normalize('NFKC').replace(/\s+/g, '');
          for (const term of expand(token)) {
            if (term.length < 2 && !/^[A-Za-z]{2}$/.test(term)) continue;
            const n = countOf(doc.text, term);
            if (n === 0) continue;
            const specificity = (isFull ? 2 : term === token ? 1.2 : 0.8) * (term.length >= 4 ? 1.3 : 1);
            score += w * Math.sqrt(Math.min(n, 6)) * specificity;
            hits.add(term);
          }
        }
      }
      return { id: job.id, label: job.label, score: Math.round(score * 10) / 10, hits: [...hits] };
    })
    .sort((a, b) => b.score - a.score);
}

/** 採用ページの文章に、職種名（またはその主要語）がそのまま載っているか */
export function isExactInRecruitment(job: JobCandidate, docs: EvidenceDoc[]): boolean {
  const rec = docs.filter((d) => d.kind === '採用ページ');
  const full = job.label.normalize('NFKC').replace(/\s+/g, '');
  const parenInner = [...job.label.normalize('NFKC').matchAll(/[（(]([^）)]+)[）)]/g)].map((m) => m[1]);
  const terms = [full, ...parenInner].filter((t) => t.length >= 2);
  return rec.some((d) => terms.some((t) => countOf(d.text, t) > 0));
}

/** 根拠表示用: 最初に見つかった語の前後を短く切り出す */
export function snippetFor(docs: EvidenceDoc[], hits: string[], radius = 40): { url: string; kind: string; snippet: string } | null {
  const order = [...docs].sort((a, b) => (WEIGHT[b.kind] ?? 1) - (WEIGHT[a.kind] ?? 1));
  for (const d of order) {
    const norm = d.text.normalize('NFKC');
    for (const h of hits) {
      const i = norm.toLowerCase().indexOf(h.toLowerCase());
      if (i >= 0) {
        const s = norm.slice(Math.max(0, i - radius), i + h.length + radius).replace(/\s+/g, ' ').trim();
        return { url: d.url, kind: d.kind, snippet: s };
      }
    }
  }
  return null;
}

export interface RulePick {
  pick: JobScore | null;
  confident: boolean;
  second: JobScore | null;
}

/** 明確な差があるときだけルールで決める。差が小さい/根拠が弱いときは confident=false（AIまたは手動へ） */
export function pickByRule(scores: JobScore[]): RulePick {
  const top = scores[0] ?? null;
  const second = scores[1] ?? null;
  if (!top || top.score < 3) return { pick: top && top.score > 0 ? top : null, confident: false, second };
  const confident = !second || top.score >= second.score * 1.5;
  return { pick: top, confident, second };
}
