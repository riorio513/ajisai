import { describe, it, expect } from 'vitest';
import { analyzeForms } from '../src/form-analyzer/analyze';
import { buildPlan } from '../src/clipboard/plan';
import { sampleModel } from './helpers/xlsx';
import type { InputPlan, RawField, RawFormInfo } from '../src/shared/types';

let order = 0;
function field(over: Partial<RawField>): RawField {
  return {
    order: order++, tag: 'input', type: 'text', name: '', id: '', placeholder: '', required: false, ariaRequired: false, maxlength: null, minlength: null,
    pattern: '', inputmode: '', autocomplete: '', ariaLabel: '', title: '', label: '', hint: '', nearText: '', groupLabel: '', classText: '', options: [],
    rect: { top: 0, left: 0, width: 100, height: 20 }, frameUrl: 'http://x/', inShadow: false, disabled: false, readonly: false, multiple: false, ...over,
  };
}
function formOf(fields: RawField[]): RawFormInfo {
  fields = fields.map((f, i) => ({ ...f, order: i }));
  return { index: 0, frameUrl: 'http://x/', isIframe: false, formId: '', formName: '', formClass: '', hasFormTag: true, headings: [], text: '', submitLabels: [], fields, isSearchLike: false };
}
const mail = () => field({ type: 'email', label: 'メールアドレス', name: 'email' });
const msg = () => field({ tag: 'textarea', type: 'textarea', label: 'お問い合わせ内容', name: 'body' });

async function planFor(fields: RawField[]): Promise<InputPlan> {
  order = 0;
  const m = await sampleModel();
  const a = analyzeForms({ url: 'http://x/', title: 't', forms: [formOf([...fields, mail(), msg()])], captcha: { present: false, kinds: [] }, pageText: '' })!;
  return buildPlan({ analysis: a, master: m.master!, companyName: '株式会社テスト', template: m.templates[0] });
}
const first = (p: InputPlan) => p.items[0];

describe('入力形式の変換（フォーム条件に合わせた機械的変換）', () => {
  it('郵便番号1欄: 入力例がハイフンあり → 160-0023', async () => {
    const p = await planFor([field({ label: '郵便番号', name: 'zip', placeholder: '123-4567' })]);
    expect(first(p).value).toBe('160-0023');
  });
  it('郵便番号1欄: 「ハイフンなし」 → 1600023', async () => {
    const p = await planFor([field({ label: '郵便番号（ハイフンなし）', name: 'zip' })]);
    expect(first(p).value).toBe('1600023');
  });
  it('郵便番号1欄: pattern属性で形式を確定', async () => {
    const p = await planFor([field({ label: '郵便番号', name: 'zip', pattern: '[0-9]{7}' })]);
    expect(first(p).value).toBe('1600023');
    expect(first(p).note).toContain('pattern');
  });
  it('郵便番号1欄: 手がかりなし → 複数候補（推奨なし・要確認）', async () => {
    const p = await planFor([field({ label: '郵便番号', name: 'zip' })]);
    expect(first(p).status).toBe('candidates');
    expect(first(p).candidates!.map((c) => c.value)).toEqual(['1600023', '160-0023']);
    expect(first(p).candidates!.every((c) => !c.recommended)).toBe(true);
    expect(first(p).note).toContain('要確認');
  });
  it('電話番号: maxlength=11 ならハイフンあり(13文字)は入らないのでハイフンなし', async () => {
    const p = await planFor([field({ label: '電話番号', type: 'tel', name: 'tel', maxlength: 11 })]);
    expect(first(p).value).toBe('08012345678');
  });
  it('電話番号: 手がかりなし → 2候補（推奨なし）', async () => {
    const p = await planFor([field({ label: '電話番号', type: 'tel', name: 'tel' })]);
    expect(first(p).candidates!.map((c) => c.value)).toEqual(['08012345678', '080-1234-5678']);
  });
  it('電話番号: 全角指定なら全角数字', async () => {
    const p = await planFor([field({ label: '電話番号（全角・ハイフンなし）', name: 'tel' })]);
    expect(first(p).value).toBe('０８０１２３４５６７８');
  });
  it('フリガナ: ひらがな指定', async () => {
    const p = await planFor([field({ label: 'ふりがな（ひらがな）', name: 'furigana' })]);
    expect(first(p).value).toBe('やまだ たろう');
  });
  it('フリガナ: 半角カナ指定', async () => {
    const p = await planFor([field({ label: 'フリガナ（半角カナ）', name: 'kana' })]);
    expect(first(p).value).toBe('ﾔﾏﾀﾞ ﾀﾛｳ');
  });
  it('フリガナ: ひらがなかカタカナか不明 → 両方を候補に（推奨なし）', async () => {
    const p = await planFor([field({ label: '読み仮名', name: 'yomi' })]);
    expect(first(p).std).not.toBe('unknown');
    expect(first(p).candidates!.map((c) => c.value)).toEqual(['ヤマダ タロウ', 'やまだ たろう']);
  });
  it('氏名: スペースなし指定', async () => {
    const p = await planFor([field({ label: 'お名前（スペースなし）', name: 'name' })]);
    expect(first(p).value).toBe('山田太郎');
  });
  it('会社名: 全角指定なら英数字を全角にする（日本語はそのまま）', async () => {
    const m = await sampleModel();
    order = 0;
    const a = analyzeForms({ url: 'http://x/', title: 't', forms: [formOf([field({ label: '会社名（全角）', name: 'company' }), mail(), msg()])], captcha: { present: false, kinds: [] }, pageText: '' })!;
    const master = structuredClone(m.master!);
    master.values.companyName = 'ABCテスト株式会社1';
    const p = buildPlan({ analysis: a, master, companyName: 'x', template: m.templates[0] });
    expect(p.items[0].value).toBe('ＡＢＣテスト株式会社１');
  });
  it('メールアドレスは原文のまま（大文字小文字・全角半角の変換をしない）', async () => {
    const m = await sampleModel();
    order = 0;
    const a = analyzeForms({ url: 'http://x/', title: 't', forms: [formOf([mail(), msg()])], captcha: { present: false, kinds: [] }, pageText: '' })!;
    const master = structuredClone(m.master!);
    master.values.email = 'Taro.Yamada+Test@Example.CO.JP';
    const p = buildPlan({ analysis: a, master, companyName: 'x', template: m.templates[0] });
    expect(p.items[0].value).toBe('Taro.Yamada+Test@Example.CO.JP');
  });
  it('住所: 都道府県・市区町村・番地・建物が別欄 (東京23区は市区町村を確実に分離できる)', async () => {
    const p = await planFor([
      field({ label: '都道府県', name: 'pref', tag: 'select', type: 'select', options: [{ value: '東京都', label: '東京都' }, { value: '大阪府', label: '大阪府' }] }),
      field({ label: '市区町村', name: 'city' }),
      field({ label: '番地', name: 'street' }),
      field({ label: '建物名', name: 'building' }),
    ]);
    const v = Object.fromEntries(p.items.map((i) => [i.std, i.value ?? i.choice?.action]));
    expect(v.prefecture).toBe('「東京都」を選択');
    expect(v.city).toBe('新宿区');
    expect(v.street).toBe('西新宿1-2-3');
    expect(v.building).toBe('テストビル5F');
  });
  it('結果の値に、前後の余計な空白や改行を足していない', async () => {
    const p = await planFor([
      field({ label: '会社名', name: 'company' }), field({ label: '部署名', name: 'dept' }), field({ label: 'お名前', name: 'name' }),
    ]);
    for (const it of p.items) if (it.value !== undefined && it.std !== 'body') expect(it.value).toBe(it.value.trim());
  });
});
