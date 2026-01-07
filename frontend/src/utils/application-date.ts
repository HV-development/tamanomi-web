/**
 * Applicationの日付判定ユーティリティ
 * バックエンドのApplicationDateServiceと同じロジックを実装
 */

/**
 * firstExecutedDateが未来日かどうかを判定
 * 未来の場合は継続課金処理をスキップする
 * 
 * @param firstExecutedDate 初回実行日（YYYYMMDD形式の文字列、nullまたはundefinedも可）
 * @returns true: 未来日の場合（継続課金をスキップ）、false: 過去日または当日の場合
 */
export function isFutureExecutedDate(firstExecutedDate?: string | null): boolean {
  if (!firstExecutedDate) {
    return false;
  }

  const trimmed = firstExecutedDate.trim();
  if (!trimmed) {
    return false;
  }

  const isValidFormat = /^\d{8}$/.test(trimmed);
  if (!isValidFormat) {
    console.warn('[application-date] firstExecutedDate format is invalid. Expected YYYYMMDD.', {
      firstExecutedDate,
    });
    return false;
  }

  // JST（日本標準時）で現在の日付を取得
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const current = `${jst.getUTCFullYear()}${String(jst.getUTCMonth() + 1).padStart(2, '0')}${String(jst.getUTCDate()).padStart(2, '0')}`;

  return trimmed > current;
}

