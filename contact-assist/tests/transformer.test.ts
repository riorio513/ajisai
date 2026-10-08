import { describe, it, expect } from 'vitest';
import {
  digitsOf, splitPhone, formatPostal, splitFullName, joinName, hiraToKata, kataToHira,
  halfKanaToFull, fullKanaToHalf, toHalfWidthAscii, toFullWidthAscii, kanaScriptOf,
  splitPrefecture, splitTokyoWard, composeAddress, countChars, countCharsCrlf,
} from '../src/transformer';

describe('電話番号', () => {
  it('ハイフンあり/なし/全角から数字を取り出す', () => {
    expect(digitsOf('080-3457-0133')).toBe('08034570133');
    expect(digitsOf('０８０－３４５７－０１３３')).toBe('08034570133');
    expect(digitsOf('(03)1234-5678')).toBe('0312345678');
  });
  it('携帯番号は3-4-4に確定できる', () => {
    expect(splitPhone('08034570133')).toEqual({ parts: ['080', '3457', '0133'], basis: 'rule' });
  });
  it('Excelに明示された区切りを根拠にできる', () => {
    expect(splitPhone('0422123456', ['0422-12-3456'])).toEqual({ parts: ['0422', '12', '3456'], basis: 'explicit' });
  });
  it('区切りを確定できない番号は null（適当に区切らない）', () => {
    expect(splitPhone('0422123456')).toBeNull();
    expect(splitPhone('0422123456', ['0422-12-3456', '04-2212-3456'])).toBeNull();
  });
  it('03/06 は 2-4-4', () => {
    expect(splitPhone('0312345678')?.parts).toEqual(['03', '1234', '5678']);
    expect(splitPhone('0661234567')?.parts).toEqual(['06', '6123', '4567']);
  });
  it('フリーダイヤルは 4-3-3', () => {
    expect(splitPhone('0120123456')?.parts).toEqual(['0120', '123', '456']);
  });
});

describe('郵便番号', () => {
  it('1600023 → 160-0023 / 160 / 0023', () => {
    const f = formatPostal('1600023')!;
    expect(f.plain).toBe('1600023');
    expect(f.hyphen).toBe('160-0023');
    expect(f.parts).toEqual(['160', '0023']);
  });
  it('ハイフン付き・全角・〒付きも同じ結果', () => {
    expect(formatPostal('160-0023')?.parts).toEqual(['160', '0023']);
    expect(formatPostal('〒１６０－００２３')?.plain).toBe('1600023');
  });
  it('桁数が違えば null', () => {
    expect(formatPostal('16000')).toBeNull();
  });
});

describe('氏名', () => {
  it('空白1つなら姓名に分割できる', () => {
    expect(splitFullName('名嘉眞 要')).toEqual({ last: '名嘉眞', first: '要' });
    expect(splitFullName('名嘉眞　要')).toEqual({ last: '名嘉眞', first: '要' });
  });
  it('区切りがなければ分割しない', () => {
    expect(splitFullName('名嘉眞要')).toBeNull();
    expect(splitFullName('A B C')).toBeNull();
  });
  it('結合の3形式', () => {
    expect(joinName('名嘉眞', '要', 'space')).toBe('名嘉眞 要');
    expect(joinName('名嘉眞', '要', 'fullwidth-space')).toBe('名嘉眞　要');
    expect(joinName('名嘉眞', '要', 'none')).toBe('名嘉眞要');
  });
});

describe('かな・幅変換', () => {
  it('ひらがな⇔カタカナ', () => {
    expect(hiraToKata('なかま かなめ')).toBe('ナカマ カナメ');
    expect(kataToHira('ナカマ カナメ')).toBe('なかま かなめ');
    expect(hiraToKata('ー')).toBe('ー');
  });
  it('半角カナ⇔全角カナ', () => {
    expect(halfKanaToFull('ﾅｶﾏ ｶﾅﾒ')).toBe('ナカマ カナメ');
    expect(halfKanaToFull('ｶﾞｷﾞﾊﾟｳﾞ')).toBe('ガギパヴ');
    expect(fullKanaToHalf('ガギパヴ')).toBe('ｶﾞｷﾞﾊﾟｳﾞ');
    expect(fullKanaToHalf('ナカマ')).toBe('ﾅｶﾏ');
  });
  it('全角⇔半角ASCII（日本語には触れない）', () => {
    expect(toHalfWidthAscii('ＡＢＣ１２３－ｘ')).toBe('ABC123-x');
    expect(toFullWidthAscii('Ab1-x')).toBe('Ａｂ１－ｘ');
    expect(toHalfWidthAscii('株式会社ＡＢＣ')).toBe('株式会社ABC');
  });
  it('かな種別判定', () => {
    expect(kanaScriptOf('なかま かなめ')).toBe('hiragana');
    expect(kanaScriptOf('ナカマ　カナメ')).toBe('katakana');
    expect(kanaScriptOf('ﾅｶﾏ')).toBe('katakana');
    expect(kanaScriptOf('名嘉眞')).toBe('other');
  });
});

describe('住所', () => {
  it('都道府県を確実に分離する', () => {
    expect(splitPrefecture('東京都新宿区西新宿1-1-1')).toEqual({ prefecture: '東京都', rest: '新宿区西新宿1-1-1' });
    expect(splitPrefecture('京都府京都市')?.prefecture).toBe('京都府');
    expect(splitPrefecture('新宿区西新宿')).toBeNull();
  });
  it('23区だけ市区町村を分離できる', () => {
    expect(splitTokyoWard('東京都', '新宿区西新宿1-1-1')).toEqual({ city: '新宿区', rest: '西新宿1-1-1' });
    expect(splitTokyoWard('神奈川県', '横浜市中区')).toBeNull();
  });
  it('連結', () => {
    expect(composeAddress({ prefecture: '東京都', city: '新宿区', town: '西新宿', street: '1-1-1', building: 'ABCビル5F' }))
      .toBe('東京都新宿区西新宿1-1-1 ABCビル5F');
    expect(composeAddress({})).toBeNull();
  });
});

describe('文字数', () => {
  it('UTF-16で数える / CRLF換算', () => {
    expect(countChars('あ\nい')).toBe(3);
    expect(countCharsCrlf('あ\nい')).toBe(4);
    expect(countCharsCrlf('あ\r\nい')).toBe(4);
  });
});
