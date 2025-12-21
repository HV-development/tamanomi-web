/**
 * 認証ヘッダー取得ユーティリティ
 * Authorization ヘッダーまたはCookieからアクセストークンを取得
 */

/**
 * Requestからアクセストークンを取得してAuthorizationヘッダーを返す
 * 1. Authorization ヘッダーがあればそれを使用
 * 2. なければCookieから取得（NextRequestのcookies APIもサポート）
 * 3. どちらもなければnull
 */
export function getAuthHeader(request: Request | { cookies?: { get: (name: string) => { value: string } | undefined }; headers: Headers }): string | null {
  // まずAuthorizationヘッダーをチェック
  const headerToken = request.headers.get('authorization');
  if (headerToken) {
    return headerToken;
  }

  // NextRequestのcookies APIから取得を試みる
  if ('cookies' in request && request.cookies) {
    // __Host-プレフィックス付きのCookieを優先的にチェック
    const hostAccessTokenCookie = request.cookies.get('__Host-accessToken');
    if (hostAccessTokenCookie?.value) {
      return `Bearer ${hostAccessTokenCookie.value}`;
    }
    
    const accessTokenCookie = request.cookies.get('accessToken');
    if (accessTokenCookie?.value) {
      return `Bearer ${accessTokenCookie.value}`;
    }
  }

  // Cookieヘッダーから取得（フォールバック）
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  // __Host-プレフィックス付きのCookieを優先的にチェック
  const hostAccessPair = pairs.find(v => v.startsWith('__Host-accessToken='));
  if (hostAccessPair) {
    const accessToken = decodeURIComponent(hostAccessPair.split('=')[1] || '');
    if (accessToken) {
      return `Bearer ${accessToken}`;
    }
  }
  
  const accessPair = pairs.find(v => v.startsWith('accessToken='));
  const accessToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  
  return accessToken ? `Bearer ${accessToken}` : null;
}

/**
 * Requestからリフレッシュトークンを取得
 * Cookieから取得し、なければnullを返す
 */
export function getRefreshToken(request: Request | { cookies?: { get: (name: string) => { value: string } | undefined }; headers: Headers }): string | null {
  // NextRequestのcookies APIから取得を試みる
  if ('cookies' in request && request.cookies) {
    const refreshTokenCookie = request.cookies.get('refreshToken') || request.cookies.get('__Host-refreshToken');
    if (refreshTokenCookie?.value) {
      return refreshTokenCookie.value;
    }
  }

  // Cookieヘッダーから取得（フォールバック）
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const refreshPair = pairs.find(v => v.startsWith('refreshToken=')) || pairs.find(v => v.startsWith('__Host-refreshToken='));
  const refreshToken = refreshPair ? decodeURIComponent(refreshPair.split('=')[1] || '') : '';
  
  return refreshToken || null;
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

