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
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      return false;
    }

    const response = await fetch(`/api/coupons/usage-history/today?shopId=${shopId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
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


