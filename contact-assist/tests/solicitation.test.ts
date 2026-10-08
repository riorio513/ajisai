import { describe, it, expect } from 'vitest';
import { detectSolicitation } from '../src/research/solicitation';

const v = (text: string) => detectSolicitation([{ url: 'https://example.com/contact', kind: '問い合わせ案内', text }]);

describe('営業禁止の検出（文脈を見る）', () => {
  const banned = [
    '営業目的でのお問い合わせはお断りしております。',
    '当社へのセールス、勧誘、広告宣伝を目的としたお問い合わせはご遠慮ください。',
    '商品・サービスの売り込みは禁止します。',
    '営業のお電話・メールはお断りいたします。',
    '営業・勧誘目的でのご利用はできません。',
    '※営業メールの送信は固くお断りします',
    '広告、宣伝目的でのご利用はご遠慮ください。',
    'Sales solicitation is prohibited.',
    '営業活動を目的としたお問い合わせには対応いたしません。',
  ];
  for (const t of banned) {
    it(`禁止: ${t}`, () => {
      const r = v(t);
      expect(r.verdict).toBe('banned');
      expect(r.findings[0].sentence.length).toBeGreaterThan(0);
    });
  }

  const notBanned = [
    '営業に関するお問い合わせはこちらのフォームからお願いします。',
    '営業時間外のお問い合わせはご遠慮ください。',
    '営業日：月〜金 9:00-18:00',
    '営業部へのご連絡は下記までお願いします。',
    '個人情報を営業目的で利用することはありません。',
    'サービスのご提案・営業のお問い合わせも歓迎いたします。',
    'お問い合わせの内容によっては返信までお時間をいただきます。',
    '営業担当者よりご連絡いたします。',
  ];
  for (const t of notBanned) {
    it(`禁止ではない: ${t}`, () => {
      expect(v(t).verdict).toBe('none');
    });
  }

  it('条件つきの表現は「要確認」にする（勝手に〇にしない）', () => {
    const r = v('営業目的のお問い合わせには、返信できない場合があります。');
    expect(r.verdict).toBe('unclear');
  });
  it('禁止と歓迎が同じ文にあれば要確認', () => {
    expect(v('営業のご連絡は歓迎しますが、勧誘はお断りします。').verdict).not.toBe('none');
  });
  it('根拠の文と確認URLを返す', () => {
    const r = detectSolicitation([
      { url: 'https://a.example/top', kind: '公式サイト', text: 'ようこそ。' },
      { url: 'https://a.example/contact', kind: '問い合わせ案内', text: 'お問い合わせはこちら。\n営業目的のお問い合わせはお断りしております。\nよろしくお願いします。' },
    ]);
    expect(r.verdict).toBe('banned');
    expect(r.findings[0]).toMatchObject({ url: 'https://a.example/contact', kind: '問い合わせ案内' });
    expect(r.findings[0].sentence).toContain('営業目的');
  });
});
