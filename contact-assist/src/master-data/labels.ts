/**
 * 「お問い合わせ情報」のラベル（会社名・電話番号など）を意味分類する。
 * 列番号・行番号には依存せず、ラベル文字列だけで判定する。
 */
import type { MasterFieldId } from '../shared/types';
import { normalizeHeader } from '../schema/normalize';

export interface LabelInfo {
  field: MasterFieldId;
  /** 電話番号1/2/3 のような連番 */
  part?: number;
}

const KANA_WORDS = /フリガナ|ふりがな|カタカナ|ひらがな|カナ|かな|よみ|読み|furigana|kana|yomi|ﾌﾘｶﾞﾅ/;

/** ラベルが電話番号の FAX など「使わないが紛らわしい」ものか */
export function isIgnoredLabel(label: string): boolean {
  const n = normalizeHeader(label);
  return /fax|ファックス|ファクス/.test(n) || (/(メール|mail)/.test(n) && /(確認|confirm|再入力)/.test(n));
}

export function parseMasterLabel(label: string): LabelInfo | null {
  const n = normalizeHeader(label);
  if (!n || n.length > 40) return null;
  if (isIgnoredLabel(label)) return null;

  const stripped = n.replace(/漢字|全角|半角/g, '');
  const partMatch = /([1-3])$/.exec(stripped);
  const part = partMatch ? Number(partMatch[1]) : undefined;
  const base = partMatch ? stripped.slice(0, -1) : stripped;

  // メール
  if (/メール|mail/.test(base)) return { field: 'email' };
  // 電話
  if (/電話|tel|携帯|phone|でんわ/.test(base)) {
    if (part) return { field: `phone${part}` as MasterFieldId, part };
    return { field: 'phone' };
  }
  // 郵便番号
  if (/郵便|〒|zip|postal|ゆうびん/.test(base)) {
    if (part && part <= 2) return { field: `postal${part}` as MasterFieldId, part };
    return { field: 'postal' };
  }
  // 問い合わせ種別
  if (/(問い合わせ|問合せ|お問合せ|お問い合わせ).*(種別|区分|項目|カテゴリ|種類)/.test(base) || /^(種別|区分)$/.test(base)) {
    return { field: 'inquiryType' };
  }
  // URL
  if (/url|ホームページ|webサイト|ウェブサイト|コーポレートサイト|hp$|^サイト$/.test(base)) return { field: 'url' };
  // 住所の各部
  if (/都道府県|prefecture/.test(base)) return { field: 'prefecture' };
  if (/市区町村|市町村|市区郡|city/.test(base)) return { field: 'city' };
  if (/町域|町名|大字/.test(base)) return { field: 'town' };
  if (/番地|street/.test(base)) return { field: 'street' };
  if (/建物|ビル|マンション|building|部屋番号/.test(base)) return { field: 'building' };
  if (/住所|所在地|address/.test(base)) return { field: 'address', part };
  // 部署・役職
  if (/部署|部門|所属|部課|department/.test(base)) return { field: 'department' };
  if (/役職|肩書|position|役割/.test(base)) return { field: 'position' };
  // 会社
  if (/会社|企業|法人|社名|貴社|御社|組織|団体|company|屋号/.test(base)) {
    return { field: KANA_WORDS.test(base) ? 'companyKana' : 'companyName' };
  }
  // 個人名
  const personBase = /氏名|名前|なまえ|担当者|代表者|送信者|差出人|name|姓名|姓|苗字|名字|セイ|せい|メイ|めい|フリガナ|ふりがな|カナ|かな|カタカナ|ひらがな|よみ|読み|furigana|kana|yomi/;
  const isBareName = base === '名' || base === '姓';
  if (!personBase.test(base) && !isBareName) return null;

  const kana = KANA_WORDS.test(base) || /^(セイ|せい|メイ|めい)$/.test(base) || /(セイ|せい|メイ|めい)/.test(base);
  let m = base.replace(KANA_WORDS, '');
  const isLast = /姓(?!名)|苗字|名字|セイ|せい|last|family|sur/.test(m) && !/姓名/.test(m);
  m = m.replace(/姓名/g, '');
  let rest = m.replace(/氏名|お名前|ご氏名|名前|なまえ|担当者名|ご担当者名|ご担当者|担当者|代表者名|代表者|送信者名|送信者|差出人|name/g, '');
  const wasFull = rest.length !== m.length || m === '' || /姓名/.test(base);
  const isFirst = /名|メイ|めい|first|given/.test(rest);
  if (isLast && !isFirst) return { field: kana ? 'lastKana' : 'lastName' };
  if (isFirst && !isLast) return { field: kana ? 'firstKana' : 'firstName' };
  if (isBareName) return { field: base === '名' ? 'firstName' : 'lastName' };
  if (wasFull || rest === '') return { field: kana ? 'fullKana' : 'fullName' };
  return null;
}
