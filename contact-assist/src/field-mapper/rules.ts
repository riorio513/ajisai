/**
 * フォーム項目の意味分類（ルールベース）。
 * 曖昧なものは unknown のままにし、勝手に推測しない。AI は呼び出し側で unknown に対してだけ使う。
 */
import type { ControlKind, RawField, StdField } from '../shared/types';
import { PREFECTURES } from '../transformer';
import { nameTokens, norm, stripMarkers } from '../form-analyzer/text';

export interface Classification {
  std: StdField;
  reason: string;
  confidence: 'high' | 'low';
}

type Src = 'L' | 'N' | 'P' | 'C';
interface Rule {
  std: StdField;
  src: Src;
  re: RegExp;
  w: number;
  /** 適用する制御種別（省略で全て） */
  only?: ControlKind[];
  /** 重みの倍率（制御種別ごと） */
  scale?: Partial<Record<ControlKind, number>>;
}

const KANA_L = /フリガナ|ふりがな|ﾌﾘｶﾞﾅ|カナ|かな|よみがな|読み|よみ|kana|furigana|yomi/;
const KANA_N = /(^|_)(kana|furigana|yomi|hira|katakana|furi|huri)(_|$)|_kana|kana_/;
const CONFIRM = /確認|confirm|confirmation|再入力|もう一度|retype|re_?enter|verify|conf(_|$)|check(_|$)|2回目|（再）|\(再\)/;

// 区切り: N は `_tel_` のように前後が _ になっている
const RULES: Rule[] = [
  // メール
  { std: 'email', src: 'L', re: /メール|e-?mail|mailアドレス/, w: 6 },
  { std: 'email', src: 'N', re: /_(e_?mail|mail|mailaddr|mail_address|email_address|emailaddress|mailaddress)_/, w: 5 },
  { std: 'email', src: 'P', re: /@/, w: 3 },
  // 電話
  { std: 'phone', src: 'L', re: /電話|でんわ|携帯|tel\b|phone|ｔｅｌ|連絡先番号/, w: 6 },
  { std: 'phone', src: 'N', re: /_(tel|telephone|phone|mobile|fon|denwa|tel\d?|phone\d?)_/, w: 5 },
  { std: 'fax', src: 'L', re: /fax|ファックス|ファクス/, w: 9 },
  { std: 'fax', src: 'N', re: /_fax\d?_/, w: 8 },
  // 郵便番号
  { std: 'postal', src: 'L', re: /郵便|〒|zip|postal|ゆうびん/, w: 7 },
  { std: 'postal', src: 'N', re: /_(zip|zipcode|zip_code|postal|postcode|post_code|yubin|postal_code)\d?_/, w: 6 },
  // 住所の各部
  { std: 'prefecture', src: 'L', re: /都道府県|prefecture/, w: 8 },
  { std: 'prefecture', src: 'N', re: /_(pref|prefecture|todofuken|state)_/, w: 6 },
  { std: 'city', src: 'L', re: /市区町村|市町村|市区郡|city|市区/, w: 7 },
  { std: 'city', src: 'N', re: /_(city|shiku|shikuchoson|address_level2)_/, w: 5 },
  { std: 'town', src: 'L', re: /町域|町名|大字|丁目/, w: 6 },
  { std: 'street', src: 'L', re: /番地|street|丁目番地/, w: 6 },
  { std: 'street', src: 'N', re: /_(street|banchi|address_?line1|address1|addr1)_/, w: 5 },
  { std: 'building', src: 'L', re: /建物|ビル名|マンション|building|部屋番号|アパート/, w: 7 },
  { std: 'building', src: 'N', re: /_(building|bldg|address_?line2|address2|addr2|tatemono)_/, w: 6 },
  { std: 'address', src: 'L', re: /住所|所在地|address|ご住所/, w: 6 },
  { std: 'address', src: 'N', re: /_(address|addr|jusho|street_address|shozaichi)_/, w: 5 },
  // 会社・部署・役職
  { std: 'company', src: 'L', re: /会社|企業|貴社|御社|法人|団体|組織|社名|company|corp|organi[sz]ation/, w: 6 },
  { std: 'company', src: 'N', re: /_(company|corp|corporate|organi[sz]ation|org|kaisha|shamei|firm|company_name|companyname|corp_name|office)_/, w: 5 },
  { std: 'department', src: 'L', re: /部署|部門|所属|部課|department|division/, w: 7 },
  { std: 'department', src: 'N', re: /_(dept|department|busho|division|section)_/, w: 6 },
  { std: 'position', src: 'L', re: /役職|肩書|position|job ?title/, w: 7 },
  { std: 'position', src: 'N', re: /_(position|yakushoku|job_?title|post|yaku)_/, w: 5 },
  // 氏名
  { std: 'name', src: 'L', re: /お名前|氏名|名前|なまえ|担当者|ご担当|代表者|(?<!company )(?<!corp )\bname\b|ご氏名|送信者/, w: 6 },
  { std: 'name', src: 'N', re: /_(name|fullname|full_name|shimei|yourname|your_name|namae|contact_name|person|tantou|tantosha)_/, w: 5 },
  { std: 'lastName', src: 'L', re: /^(姓|氏|苗字|名字)$|[(（【\[](姓|氏)[)）】\]]|^(姓|氏)[\s:：(（]|last ?name|family ?name|surname/, w: 8 },
  { std: 'lastName', src: 'N', re: /_(last_?name|lastname|lname|family_?name|familyname|sei|surname|myoji|name1|name_1|name_sei|sei_name|lastnm|last)_/, w: 7 },
  { std: 'firstName', src: 'L', re: /^(名)$|[(（【\[](名)[)）】\]]|^名[\s:：(（]|first ?name|given ?name/, w: 8 },
  { std: 'firstName', src: 'N', re: /_(first_?name|firstname|fname|given_?name|givenname|mei|name2|name_2|name_mei|mei_name|firstnm|first)_/, w: 7 },
  // URL
  { std: 'url', src: 'L', re: /url|ホームページ|webサイト|ウェブサイト|サイト|hp\b/, w: 6 },
  { std: 'url', src: 'N', re: /_(url|website|homepage|web|site|hp)_/, w: 5 },
  // 問い合わせ種別
  { std: 'inquiryType', src: 'L', re: /(問い?合わ?せ|ご用件|お問合せ).*(種別|種類|区分|項目|カテゴリ|選択)|種別|カテゴリ|ご用件の種類|区分|お問い合わせ項目/, w: 7 },
  { std: 'inquiryType', src: 'N', re: /_(category|inquiry_?type|inquirytype|kind|type|genre|shubetsu|purpose|topic|kubun|subject_type)_/, w: 3 },
  // 件名
  { std: 'subject', src: 'L', re: /件名|題名|タイトル|subject|表題/, w: 7 },
  { std: 'subject', src: 'N', re: /_(subject|title|kenmei|ttl|subj)_/, w: 6 },
  // 本文
  { std: 'body', src: 'L', re: /お問い?合わ?せ内容|問い?合わ?せ内容|ご用件|ご相談|ご質問|内容|本文|メッセージ|message|comment|inquiry|detail|備考|お問合せ|ご要望|ご意見|詳細/, w: 7 },
  { std: 'body', src: 'N', re: /_(message|body|content|contents|comment|inquiry|detail|details|naiyo|honbun|memo|remarks|question|text|note|msg|enquiry|request)_/, w: 6 },
  { std: 'body', src: 'L', re: /./, w: 3, only: ['textarea'] },
  // 同意
  { std: 'consent', src: 'L', re: /同意|承諾|プライバシー|個人情報|規約|ポリシー|agree|consent|privacy|terms|確認しました/, w: 8, only: ['checkbox'] },
  { std: 'consent', src: 'N', re: /_(agree|agreement|consent|privacy|policy|terms|accept)_/, w: 6, only: ['checkbox'] },
];

/** 制御種別ごとの重み倍率。省略は text/select/textarea=1, radio/checkbox=0.3 */
const SCALE: Partial<Record<StdField, Partial<Record<ControlKind, number>>>> = {
  body: { text: 0.4, textarea: 1, select: 0, radio: 0, checkbox: 0 },
  subject: { text: 1, textarea: 0.3, select: 0.2, radio: 0, checkbox: 0 },
  inquiryType: { text: 0.5, textarea: 0, select: 1, radio: 1, checkbox: 0.8 },
  consent: { checkbox: 1, radio: 0.5 },
};
function scaleOf(std: StdField, control: ControlKind): number {
  const s = SCALE[std]?.[control];
  if (s !== undefined) return s;
  return control === 'radio' || control === 'checkbox' ? 0.3 : 1;
}

/** 総称(親)と詳細(子)の関係。子が name/id など明示的な手がかりで当たったら親は採用しない */
const PARENT_OF: Partial<Record<StdField, StdField[]>> = {
  name: ['lastName', 'firstName'],
  address: ['prefecture', 'city', 'town', 'street', 'building'],
};

const AUTOCOMPLETE: Record<string, StdField> = {
  organization: 'company', 'organization-title': 'position', name: 'name', 'family-name': 'lastName', 'given-name': 'firstName',
  email: 'email', tel: 'phone', 'tel-national': 'phone', 'postal-code': 'postal', 'address-level1': 'prefecture',
  'address-level2': 'city', 'street-address': 'address', 'address-line1': 'street', 'address-line2': 'building', url: 'url',
};

function prefectureSelect(f: RawField): boolean {
  if (f.options.length < 40) return false;
  const labels = new Set(f.options.map((o) => o.label.trim()));
  const hit = PREFECTURES.filter((p) => labels.has(p) || labels.has(p.replace(/[都道府県]$/, ''))).length;
  return hit >= 40;
}

export function controlKindOf(f: RawField): ControlKind {
  if (f.tag === 'select') return 'select';
  if (f.tag === 'textarea') return 'textarea';
  if (f.type === 'radio') return 'radio';
  if (f.type === 'checkbox') return 'checkbox';
  if (f.type === 'file') return 'file';
  if (['date', 'datetime-local', 'month', 'time', 'week'].includes(f.type)) return 'date';
  if (f.type === 'contenteditable') return 'textarea';
  if (f.type === 'password' || f.type === 'color' || f.type === 'range') return 'other';
  return 'text';
}

/** 1つの入力欄を分類する（分割欄のグループ判定は groupSplitFields で行う） */
export function classifyField(f: RawField): Classification {
  const control = controlKindOf(f);
  if (control === 'file') return { std: 'unknown', reason: 'ファイル添付欄', confidence: 'high' };
  if (control === 'other' || control === 'date') return { std: 'unknown', reason: '対応していない入力種別', confidence: 'high' };

  const L = stripMarkers([f.label, f.ariaLabel, f.groupLabel, f.title].filter(Boolean).join(' '));
  const Lfallback = L || stripMarkers(f.nearText.slice(0, 80));
  const N = nameTokens(f.name, f.id);
  const P = norm(f.placeholder);
  const C = norm(f.nearText);

  // autocomplete は仕様で意味が定義されているため最優先
  const ac = f.autocomplete.split(/\s+/).pop() ?? '';
  if (AUTOCOMPLETE[ac]) return finalize(AUTOCOMPLETE[ac], `autocomplete="${ac}"`, 'high', L, N, P);

  if (control === 'select' && prefectureSelect(f)) return { std: 'prefecture', reason: '選択肢が47都道府県', confidence: 'high' };

  const scores = new Map<StdField, { score: number; why: string[]; byName: boolean }>();
  const add = (std: StdField, w: number, why: string, byName = false) => {
    const cur = scores.get(std) ?? { score: 0, why: [], byName: false };
    cur.score += w;
    cur.why.push(why);
    cur.byName = cur.byName || byName;
    scores.set(std, cur);
  };

  if (f.type === 'email') add('email', 6, 'type=email', true);
  if (f.type === 'tel') add('phone', 5, 'type=tel', true);
  if (f.type === 'url') add('url', 7, 'type=url', true);

  const srcText: Record<Src, string> = { L: Lfallback, N, P, C };
  for (const r of RULES) {
    if (r.only && !r.only.includes(control)) continue;
    const text = srcText[r.src];
    // 周辺テキストはラベルが無い場合のみ弱く使う
    if (!text) continue;
    if (r.re.test(text)) {
      const scale = scaleOf(r.std, control);
      if (scale === 0) continue;
      add(r.std, r.w * scale, `${r.src === 'L' ? 'ラベル' : r.src === 'N' ? 'name/id' : r.src === 'P' ? 'プレースホルダー' : '周辺文'}「${(text.match(r.re) ?? [''])[0]}」`, r.src === 'N');
    }
  }
  // 周辺文は弱い補助（ラベルが空のときだけ）
  if (!L && C) {
    for (const r of RULES) {
      if (r.src !== 'L' || (r.only && !r.only.includes(control))) continue;
      if (r.re.source === '.') continue;
      const text = C.slice(0, 80);
      if (r.re.test(text)) {
        const scale = scaleOf(r.std, control);
        if (scale > 0) add(r.std, r.w * 0.5 * scale, `周辺文「${(text.match(r.re) ?? [''])[0]}」`);
      }
    }
  }

  // かな系: 氏名/会社の読み仮名
  const isKana = KANA_L.test(L) || KANA_N.test(N) || (P && !/[a-z0-9]/.test(P) && /^[ぁ-んァ-ヶー\s・]+$/.test(P) && !!(L && /名前|氏名|お名前/.test(L) && /^[ァ-ヶー\s]+$/.test(P) && false));
  if (isKana) {
    const company = /会社|企業|法人|団体|貴社|御社|company|corp/.test(L + N);
    const last = /(^|[^氏])(姓|セイ|せい)|last|family|sei/.test(L.replace(/フリガナ|ふりがな|カナ|かな/g, ' ') + ' ' + N) && !/名前|氏名/.test(L);
    const first = /(^|\s)(名|メイ|めい)(\s|$|[)）])|first|given|mei/.test(L.replace(/フリガナ|ふりがな|カナ|かな/g, ' ') + ' ' + N);
    const std: StdField = company ? 'companyKana' : last && !first ? 'lastKana' : first && !last ? 'firstKana' : 'kana';
    return { std, reason: `かなの欄（${(L || N).trim().slice(0, 30)}）`, confidence: 'high' };
  }

  // 「確認」付きメール
  if ((scores.get('email')?.score ?? 0) >= 5 && (CONFIRM.test(L) || CONFIRM.test(N) || CONFIRM.test(P))) {
    return { std: 'emailConfirm', reason: 'メール欄に「確認/confirm」の表示', confidence: 'high' };
  }

  // 姓・名: ラベルが「氏名」で name 属性が sei/mei などの場合は、N のスコアが優先される
  for (const [parent, children] of Object.entries(PARENT_OF) as [StdField, StdField[]][]) {
    if (children.some((c) => scores.get(c)?.byName)) scores.delete(parent);
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1].score - a[1].score);
  if (ranked.length === 0) return { std: 'unknown', reason: '手がかりなし', confidence: 'high' };
  const [top, second] = ranked;
  if (top[1].score < 5) return { std: 'unknown', reason: `手がかりが弱い（${top[0]}: ${top[1].why.join(', ')}）`, confidence: 'high' };
  if (second && top[1].score - second[1].score < 2) {
    return { std: 'unknown', reason: `複数の候補が拮抗（${top[0]}/${second[0]}）`, confidence: 'high' };
  }
  return finalize(top[0], top[1].why.join(', '), top[1].score >= 9 ? 'high' : 'low', L, N, P);
}

function finalize(std: StdField, reason: string, confidence: 'high' | 'low', L: string, N: string, P: string): Classification {
  // 郵便/電話の「確認」「FAX」などの取り違え防止
  if (std === 'email' && (CONFIRM.test(L) || CONFIRM.test(N) || CONFIRM.test(P))) {
    return { std: 'emailConfirm', reason: reason + '（確認欄）', confidence };
  }
  return { std, reason, confidence };
}

/**
 * 連続する同種の欄をまとめて、分割入力（電話3分割・郵便2分割・姓名）を判定する。
 * 戻り値: 各欄の最終分類（入力と同じ長さ）。
 */
export function groupSplitFields(
  fields: RawField[],
  base: Classification[],
): { cls: Classification; splitIssue?: 'phone' | 'postal' }[] {
  const out = base.map((c) => ({ cls: { ...c } as Classification, splitIssue: undefined as 'phone' | 'postal' | undefined }));

  const groupRuns = (std: StdField, extra?: (f: RawField, c: Classification) => boolean) => {
    const runs: number[][] = [];
    let cur: number[] = [];
    base.forEach((c, i) => {
      const ok = (c.std === std || (extra?.(fields[i], c) ?? false)) && controlKindOf(fields[i]) === 'text';
      if (ok) {
        // 同じラベルの連続だけを1つのグループとみなす
        if (cur.length && labelKey(fields[cur[0]]) !== labelKey(fields[i]) && labelKey(fields[i]) !== '' && labelKey(fields[cur[0]]) !== '') {
          runs.push(cur);
          cur = [];
        }
        cur.push(i);
      } else if (cur.length) {
        runs.push(cur);
        cur = [];
      }
    });
    if (cur.length) runs.push(cur);
    return runs;
  };

  const splitIndexFromName = (f: RawField): number | null => {
    const n = nameTokens(f.name, f.id);
    const m = /_(?:tel|phone|zip|post|postal|zipcode|tel_?no|phone_?no)_?([123abc])_/.exec(n) ?? /_([123abc])_?$/.exec(n);
    if (!m) return null;
    const ch = m[1];
    return ch === 'a' ? 1 : ch === 'b' ? 2 : ch === 'c' ? 3 : Number(ch);
  };

  // 電話
  for (const run of groupRuns('phone')) {
    if (run.length === 1) continue;
    if (run.length === 3) {
      run.forEach((idx, k) => {
        out[idx].cls = { std: (`phone${k + 1}` as StdField), reason: '同じ電話番号欄が3つ並んでいる（3分割）', confidence: 'high' };
      });
    } else {
      run.forEach((idx) => {
        out[idx].cls = { std: 'phone', reason: `電話番号の欄が${run.length}つに分かれている`, confidence: 'low' };
        out[idx].splitIssue = 'phone';
      });
    }
  }
  // 郵便番号
  for (const run of groupRuns('postal')) {
    if (run.length === 1) continue;
    if (run.length === 2) {
      run.forEach((idx, k) => {
        out[idx].cls = { std: (`postal${k + 1}` as StdField), reason: '郵便番号の欄が2つ並んでいる（2分割）', confidence: 'high' };
      });
    } else {
      run.forEach((idx) => {
        out[idx].cls = { std: 'postal', reason: `郵便番号の欄が${run.length}つに分かれている`, confidence: 'low' };
        out[idx].splitIssue = 'postal';
      });
    }
  }
  void splitIndexFromName;

  // 氏名: 「お名前」欄が2つ並び、name属性でも姓名が決まらない場合は 姓→名 の順（低信頼）
  for (const run of groupRuns('name')) {
    if (run.length === 2) {
      out[run[0]].cls = { std: 'lastName', reason: '「お名前」欄が2つ並んでいる（姓→名の順と判断）', confidence: 'low' };
      out[run[1]].cls = { std: 'firstName', reason: '「お名前」欄が2つ並んでいる（姓→名の順と判断）', confidence: 'low' };
    }
  }
  // かな: 同様に2つ並んだ場合
  for (const run of groupRuns('kana')) {
    if (run.length === 2) {
      out[run[0]].cls = { std: 'lastKana', reason: 'フリガナ欄が2つ並んでいる（姓→名の順と判断）', confidence: 'low' };
      out[run[1]].cls = { std: 'firstKana', reason: 'フリガナ欄が2つ並んでいる（姓→名の順と判断）', confidence: 'low' };
    }
  }
  return out;
}

function labelKey(f: RawField): string {
  return stripMarkers(f.label || f.groupLabel || '');
}
