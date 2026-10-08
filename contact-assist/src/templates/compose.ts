/**
 * 最終的に問い合わせフォームへ貼り付ける本文を組み立てる。
 *
 *   対象企業名 + 改行1文字(\n) + Excelの本文原文
 *
 * trim / 正規化 / 自動整形は一切しない。Excel本文の先頭に改行があれば、そのまま残る（空行が入ってよい）。
 */
export function composeBody(companyName: string, templateBody: string): string {
  return companyName + '\n' + templateBody;
}
