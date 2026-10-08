/**
 * 営業（セールス）禁止の検出。単純なキーワード一致ではなく、文単位で
 * 「営業を意味する語」と「禁止・お断りの表現」が同じ文にあるか、否定や条件がないかを見る。
 * 迷うものは banned にせず unclear（営業可否要確認）にする。
 */
import type { Evidence } from '../shared/types';

export interface Passage {
  url: string;
  kind: string;
  text: string;
}

export interface SolicitationFinding {
  url: string;
  kind: string;
  sentence: string;
  level: 'banned' | 'unclear';
  why: string;
}

export interface SolicitationResult {
  verdict: 'banned' | 'unclear' | 'none';
  findings: SolicitationFinding[];
}

// 「営業」を含むが、禁止の対象ではない語
const SALES_EXCLUDE = /営業時間|営業日|営業所|営業本部|営業部|営業課|営業拠点|営業エリア|営業中|営業終了|営業再開|営業許可|営業品目|営業職|営業利益|営業成績|営業年度|営業種目|営業報告|営業案内図/g;
const SALES_PERSON = /営業(担当|マン|スタッフ|員|の方)/;

const SALES_STRONG = /営業|セールス|勧誘|売り込み|売込|商業目的|商用目的|販売目的|販促|販売促進|宣伝|広告宣伝|sales|solicit|marketing|advertis|promotion/i;
const SALES_WEAK = /広告|提案|販売|紹介|PR目的|案内|ご紹介/;

const PROHIBIT = new RegExp([
  '禁止', '禁じ', 'お断り', 'おことわり', 'お断わり', 'ご遠慮', 'ご容赦', 'お控え', '控えて', 'お受けできません', '受け?付けておりません',
  '受け?付けていません', '受け?付けられません', '受け?付けいたしません', '受け?付けしておりません', '対応いたしかねます', '対応できかねます',
  '対応できません', '対応しておりません', '対応いたしません', '返信いたしません', '返信できません', '返信しません', '返答いたしません',
  '回答いたしません', 'お応えできません', 'お答えできません', 'ご利用いただけません', '利用できません', 'NGです', '不可です', '不可とさせて',
  'お受けいたしません', 'お受けしておりません', '承っておりません', '承れません', 'ご?利用(は|が)?できません', '返信でき(ない|かね)', '対応でき(ない|かね)', 'お答えでき(ない|かね)', 'お受けでき(ない|かね)', '受け?付けでき(ない|かね)',
  'not accept', 'not permitted', 'prohibited', 'not allowed', 'refrain', 'no solicitation', 'do not send', 'unsolicited',
].join('|'), 'i');

const NEGATION = /禁止していません|禁止しておりません|禁止ではありません|お断りしていません|お断りしておりません|お断りではありません|ご遠慮いただく必要はありません|歓迎|構いません|かまいません|問題ありません|受け付けております|受付しております|受け付けています|受け付けしております|お待ちしております/;
const SOFT = /場合があります|場合がございます|場合もあります|ことがあります|こともあります|可能性があります|場合は|ない場合|いたしかねる場合/;
const UNRELATED = /個人情報|利用目的|第三者|取得|プライバシー|cookie|クッキー|著作権|転載/;

function splitSegments(text: string): string[] {
  return text
    .split(/(?<=[。！？!?])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);
}

function hasSales(seg: string): { strong: boolean; weak: boolean; person: boolean } {
  const cleaned = seg.replace(SALES_EXCLUDE, '■');
  return { strong: SALES_STRONG.test(cleaned), weak: SALES_WEAK.test(cleaned), person: SALES_PERSON.test(seg) };
}

export function detectSolicitation(passages: Passage[]): SolicitationResult {
  const findings: SolicitationFinding[] = [];
  for (const p of passages) {
    const segs = splitSegments(p.text);
    segs.forEach((seg, i) => {
      if (UNRELATED.test(seg)) return;
      const s = hasSales(seg);
      const prohibit = PROHIBIT.test(seg);
      const sentence = seg.length > 160 ? seg.slice(0, 160) + '…' : seg;
      if (prohibit && s.strong) {
        if (NEGATION.test(seg)) findings.push({ url: p.url, kind: p.kind, sentence, level: 'unclear', why: '禁止と許可の両方を示す表現が同じ文にあります' });
        else if (SOFT.test(seg)) findings.push({ url: p.url, kind: p.kind, sentence, level: 'unclear', why: '「場合があります」など条件付きの表現です' });
        else findings.push({ url: p.url, kind: p.kind, sentence, level: 'banned', why: '営業を意味する語と、禁止・お断りの表現が同じ文にあります' });
        return;
      }
      if (prohibit && (s.weak || s.person)) {
        findings.push({ url: p.url, kind: p.kind, sentence, level: 'unclear', why: '営業に関連しうる語と禁止表現が同じ文にありますが、営業を指すか確定できません' });
        return;
      }
      // 隣の文にまたがる場合（箇条書きなど）
      if (s.strong && !prohibit) {
        const near = [segs[i - 1], segs[i + 1], segs[i + 2]].filter(Boolean).join(' ');
        if (near && PROHIBIT.test(near) && !UNRELATED.test(near) && /^[・\-●■◆※]|目的|ご遠慮|とは/.test(seg) === false && /(以下|次|下記|上記|これら|こうした|等|など)/.test(near + seg)) {
          findings.push({ url: p.url, kind: p.kind, sentence: `${seg} / ${segs[i + 1] ?? ''}`.slice(0, 160), level: 'unclear', why: '営業に関する記載と禁止表現が隣り合っています' });
        }
      }
    });
  }
  const verdict = findings.some((f) => f.level === 'banned') ? 'banned' : findings.length ? 'unclear' : 'none';
  return { verdict, findings };
}

export function evidenceFrom(findings: SolicitationFinding[], at: string, kind: Evidence['kind'] = '営業禁止'): Evidence[] {
  return findings.slice(0, 5).map((f) => ({ url: f.url, kind, snippet: f.sentence, at }));
}
