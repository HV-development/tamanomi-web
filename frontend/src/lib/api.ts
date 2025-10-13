/**
 * APIクライアント - セッションタイムアウト時の自動リダイレクト対応
 */

/**
 * 共通のfetchラッパー関数
 * 401エラー（セッションタイムアウト）時にログイン画面へリダイレクト
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // 401エラー（認証エラー）の場合はログイン画面へリダイレクト
      if (response.status === 401) {
        console.warn('🔒 Session timeout: Redirecting to login page');
        // ローカルストレージをクリア
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          // ログイン画面へリダイレクト
          window.location.href = '/';
        }
      }

      const errorData = await response.json().catch(() => ({
        message: 'Unknown error',
      }));

      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
}

/**
 * GETリクエスト用のヘルパー関数
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POSTリクエスト用のヘルパー関数
 */
export async function apiPost<T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCHリクエスト用のヘルパー関数
 */
export async function apiPatch<T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETEリクエスト用のヘルパー関数
 */
export async function apiDelete<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

