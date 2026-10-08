/** 住所の機械的な分割。確実に分けられる部分だけを分ける */

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県',
  '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
  '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const TOKYO_WARDS = [
  '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区', '江東区', '品川区', '目黒区',
  '大田区', '世田谷区', '渋谷区', '中野区', '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区',
  '足立区', '葛飾区', '江戸川区',
];

/** 先頭が都道府県名なら分離する（都道府県は47種で確実に判定できる） */
export function splitPrefecture(address: string): { prefecture: string; rest: string } | null {
  for (const p of PREFECTURES) {
    if (address.startsWith(p)) return { prefecture: p, rest: address.slice(p.length) };
  }
  return null;
}

/** 東京都23区のみ市区町村を確実に分離できる */
export function splitTokyoWard(prefecture: string, rest: string): { city: string; rest: string } | null {
  if (prefecture !== '東京都') return null;
  for (const w of TOKYO_WARDS) {
    if (rest.startsWith(w)) return { city: w, rest: rest.slice(w.length) };
  }
  return null;
}

export interface AddressPieces {
  prefecture?: string;
  city?: string;
  town?: string;
  street?: string;
  building?: string;
}

/** 分割済みの要素から住所全文を機械的に連結する（建物名の前は半角スペース1つ） */
export function composeAddress(p: AddressPieces): string | null {
  const main = [p.prefecture, p.city, p.town, p.street].filter((x): x is string => !!x).join('');
  if (!main) return null;
  return p.building ? `${main} ${p.building}` : main;
}
