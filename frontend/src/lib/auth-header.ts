/**
 * 認証ヘッダー取得ユーティリティ
 * Authorization ヘッダーまたはCookieからアクセストークンを取得
 */

/**
 * Requestからアクセストークンを取得してAuthorizationヘッダーを返す
 * 1. Authorization ヘッダーがあればそれを使用
 * 2. なければCookieから取得
 * 3. どちらもなければnull
 */
export function getAuthHeader(request: Request): string | null {
  // まずAuthorizationヘッダーをチェック
  const headerToken = request.headers.get('authorization');
  if (headerToken) {
    return headerToken;
  }

  // Cookieから取得
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const accessToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  
  return accessToken ? `Bearer ${accessToken}` : null;
}

/**
 * Requestからアクセストークンを取得してヘッダーオブジェクトを返す
 * Content-Typeを含む完全なヘッダーオブジェクトを返す
 */
export function getAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authHeader = getAuthHeader(request);
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  return headers;
}

