/**
 * Cookie管理ユーティリティ
 * クライアントサイドでCookieを読み書きするためのヘルパー関数
 */

export interface CookieOptions {
  /** 有効期限（秒数） */
  maxAge?: number;
  /** セキュアフラグ（HTTPS環境でのみ送信） */
  secure?: boolean;
  /** SameSite属性 */
  sameSite?: 'strict' | 'lax' | 'none';
  /** パス */
  path?: string;
}

/**
 * 環境に応じたsecureフラグを自動判定
 */
function isSecureEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

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
 * 
 * @param name Cookie名
 * @param value Cookie値
 * @param options Cookieオプション（maxAge, secure, sameSite, path）
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return;
  
  const {
    maxAge,
    secure = isSecureEnvironment(),
    sameSite = 'lax',
    path = '/',
  } = options;

  let cookieString = `${name}=${value}`;

  // maxAgeまたはexpiresを設定
  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  } else {
    // デフォルトで1日
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  // pathを設定
  cookieString += `; path=${path}`;

  // secureを設定
  if (secure) {
    cookieString += '; secure';
  }

  // sameSiteを設定
  cookieString += `; SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`;

  document.cookie = cookieString;
}

/**
 * Cookieを設定（後方互換性のため、daysパラメータもサポート）
 * @deprecated 新しいコードではsetCookie(name, value, options)を使用してください
 */
export function setCookieLegacy(name: string, value: string, days: number = 1): void {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  setCookie(name, value, {
    maxAge: days * 24 * 60 * 60,
    secure: isSecureEnvironment(),
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * Cookieを削除
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;
}

