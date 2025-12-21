/**
 * クーポン使用履歴チェックユーティリティ
 */

/**
 * 当日のクーポン使用履歴をチェック
 * @param shopId 店舗ID
 * @returns 使用済みの場合true
 */
export async function checkTodayUsage(shopId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/coupons/usage-history/today?shopId=${shopId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      credentials: 'include', // Cookieを送信
    });

    if (!response.ok) {
      console.error('使用履歴の取得に失敗しました:', response.status);
      return false;
    }

    const data = await response.json();
    return data.hasUsed || false;
  } catch (error) {
    console.error('使用履歴チェック中にエラーが発生しました:', error);
    return false;
  }
}

