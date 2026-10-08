/** HTML属性と周辺文章から入力条件を読み取る。判断できないものは 'unknown' のままにする。 */
import type { FieldConditions, KanaScript, RawField } from '../shared/types';
import { kanaScriptOf } from '../transformer';
import { norm } from './text';

function firstNumber(re: RegExp, text: string): number | null {
  const m = re.exec(text);
  return m ? Number(m[1]) : null;
}

/** 「1000文字以内」「最大500文字」などの文字数上限を文章から探す */
export function textLimitFrom(text: string): number | null {
  const t = norm(text);
  return (
    firstNumber(/(\d{1,6})\s*(?:文字|字)\s*(?:以内|まで|以下|未満)/, t) ??
    firstNumber(/(?:最大|上限|最長)\s*(?:で)?\s*(\d{1,6})\s*(?:文字|字)/, t) ??
    firstNumber(/(\d{1,6})\s*(?:characters?|chars?)\s*(?:or less|max|maximum)?/, t) ??
    firstNumber(/\b\d{1,6}\s*\/\s*(\d{2,6})\b/, t)
  );
}

export function parseConditions(f: RawField): FieldConditions {
  const evidence: string[] = [];
  const own = norm([f.label, f.groupLabel, f.hint, f.ariaLabel, f.title, f.placeholder].join(' '));
  const near = norm(f.nearText);
  // 「※半角で入力」のような注意書きの※は、必須マークではない
  const labelOnly = norm([f.label, f.groupLabel, f.ariaLabel].join(' ')).replace(/※\s*[^\s]{0,24}(してください|ください|ハイフン|半角|全角|のみ|で入力|入力)[^\s]*/g, ' ');

  // 必須 / 任意
  let required: boolean | 'unknown' = 'unknown';
  if (f.required) {
    required = true;
    evidence.push('HTMLのrequired属性');
  } else if (f.ariaRequired) {
    required = true;
    evidence.push('aria-required');
  } else if (/(必須|required|※|\*|＊|●|★)/.test(labelOnly) || /(必須|required)/.test(near) && /(必須|required)/.test(norm(f.label + f.classText))) {
    required = true;
    evidence.push('ラベルの必須表示');
  } else if (/(^|[-_\s])(required|req|must|hissu|is-required|necessary)([-_\s]|$)/i.test(f.classText)) {
    required = true;
    evidence.push('必須を示すclass名');
  } else if (/(任意|optional|省略可)/.test(labelOnly + ' ' + near)) {
    required = false;
    evidence.push('「任意」の表示');
  }

  // 全角 / 半角
  let width: FieldConditions['width'] = 'unknown';
  const half = /半角/.test(own);
  const full = /全角/.test(own);
  if (half && !full) {
    width = 'half';
    evidence.push('「半角」の指示');
  } else if (full && !half) {
    width = 'full';
    evidence.push('「全角」の指示');
  } else if (!half && !full) {
    const nHalf = /半角/.test(near);
    const nFull = /全角/.test(near);
    if (nHalf && !nFull) {
      width = 'half';
      evidence.push('周辺文の「半角」');
    } else if (nFull && !nHalf) {
      width = 'full';
      evidence.push('周辺文の「全角」');
    }
  }

  // 文字種
  let charset: FieldConditions['charset'] = 'unknown';
  if (f.type === 'number' || /^(numeric|decimal)$/.test(f.inputmode) || /半角数字|数字のみ|数値のみ|数字で/.test(own)) {
    charset = 'digits';
    evidence.push('数字のみの指示');
  } else if (/半角英数/.test(own)) {
    charset = 'alnum';
    evidence.push('半角英数字の指示');
  }
  let kanaScript: KanaScript = 'unknown';
  if (/カタカナ|全角カナ|半角カナ/.test(own)) {
    kanaScript = 'katakana';
    charset = 'katakana';
    evidence.push('「カタカナ」の指示');
  } else if (/ひらがな|平仮名/.test(own)) {
    kanaScript = 'hiragana';
    charset = 'hiragana';
    evidence.push('「ひらがな」の指示');
  } else {
    const ph = f.placeholder.trim();
    const phScript = ph ? kanaScriptOf(ph) : 'empty';
    if (phScript === 'katakana') {
      kanaScript = 'katakana';
      evidence.push('入力例がカタカナ');
    } else if (phScript === 'hiragana') {
      kanaScript = 'hiragana';
      evidence.push('入力例がひらがな');
    } else if (/フリガナ|ふりがな/.test(f.label)) {
      kanaScript = /ふりがな/.test(f.label) ? 'hiragana' : 'katakana';
      evidence.push('ラベルの表記（' + (/ふりがな/.test(f.label) ? 'ふりがな' : 'フリガナ') + '）');
    } else if (/hira/.test(f.name + f.id)) {
      kanaScript = 'hiragana';
      evidence.push('name属性にhira');
    } else if (/kata/.test(f.name + f.id)) {
      kanaScript = 'katakana';
      evidence.push('name属性にkata');
    }
  }

  // ハイフン
  let hyphen: FieldConditions['hyphen'] = 'unknown';
  if (/ハイフン(なし|無し|抜き|不要|は不要|無)|ハイフン[をは]?(入れず|いれず|含めず|付けず|使わず|入れない)|数字のみ|ハイフンなし/.test(own + ' ' + near)) {
    hyphen = 'without';
    evidence.push('「ハイフンなし」の指示');
  } else if (/ハイフン(あり|有り|付き|有|込み|区切り)|ハイフン[をで]?(入れて|含めて|付けて|区切)/.test(own + ' ' + near)) {
    hyphen = 'with';
    evidence.push('「ハイフンあり」の指示');
  } else {
    const ph = f.placeholder.normalize('NFKC').trim();
    if (/^\d{2,4}-\d{1,4}-\d{3,4}$/.test(ph) || /^\d{3}-\d{4}$/.test(ph)) {
      hyphen = 'with';
      evidence.push('入力例にハイフンあり');
    } else if (/^\d{7,11}$/.test(ph)) {
      hyphen = 'without';
      evidence.push('入力例にハイフンなし');
    }
  }

  // スペース
  let space: FieldConditions['space'] = 'unknown';
  if (/(スペース|空白)(なし|無し|不要|を入れない|を入れず|は不要)/.test(own + ' ' + near)) {
    space = 'without';
    evidence.push('「スペースなし」の指示');
  } else if (/(姓と名の間|姓名の間|氏名の間).*(スペース|空白)|(スペース|空白)(あり|有り|で区切|を入れて)/.test(own + ' ' + near)) {
    space = 'with';
    evidence.push('「スペースあり」の指示');
  } else {
    const ph = f.placeholder;
    if (/^[^\s　]+[ 　][^\s　]+$/.test(ph)) {
      space = 'with';
      evidence.push('入力例にスペースあり');
    }
  }

  // 文字数
  let maxLength = f.maxlength;
  if (maxLength !== null) evidence.push(`maxlength=${maxLength}`);
  if (maxLength === null && f.tag !== 'textarea') {
    const t = textLimitFrom(own);
    if (t !== null) {
      maxLength = t;
      evidence.push(`文章中の文字数上限(${t})`);
    }
  }
  if (f.minlength !== null) evidence.push(`minlength=${f.minlength}`);

  return { required, width, charset, kanaScript, hyphen, space, maxLength, minLength: f.minlength, evidence };
}
