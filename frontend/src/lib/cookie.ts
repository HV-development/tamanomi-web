/**
 * Cookie管理ユーティリティ
 * クライアントサイドでCookieを読み書きするためのヘルパー関数
 */

/**
 * Cookieを取得
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Cookieを設定（クライアントサイドでの設定用）
 * 注意: httpOnlyなCookieはサーバーサイドでのみ設定可能
 */
export function setCookie(name: string, value: string, days: number = 1): void {
  if (typeof window === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

/**
 * Cookieを削除
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}



