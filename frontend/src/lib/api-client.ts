/**
 * API呼び出しの共通処理
 * トークン期限切れ時の自動リフレッシュとログイン画面遷移を処理
 */

interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
  autoRefresh?: boolean;
}

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  /**
   * API呼び出しの共通処理
   */
  static async request<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      requireAuth = true,
      autoRefresh = true,
      headers = {},
      ...fetchOptions
    } = options;

    // 認証が必要な場合、トークンを追加
    if (requireAuth) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...fetchOptions,
      });

      // トークン期限切れの場合
      if (response.status === 403 && requireAuth && autoRefresh) {
        console.log('🔄 Token expired, attempting refresh...');
        
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // リフレッシュ成功時、元のリクエストを再実行
          const newAccessToken = localStorage.getItem('accessToken');
          if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              ...fetchOptions,
            });
            
            if (retryResponse.ok) {
              return { data: await retryResponse.json() };
            }
          }
        }
        
        // リフレッシュ失敗時、ログイン画面に遷移
        console.log('❌ Token refresh failed, redirecting to login');
        this.redirectToLogin();
        return { error: { code: 'AUTHENTICATION_FAILED', message: '認証に失敗しました' } };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || { code: 'API_ERROR', message: 'API呼び出しに失敗しました' } };
      }

      return { data: await response.json() };
    } catch (error) {
      console.error('API request error:', error);
      return { error: { code: 'NETWORK_ERROR', message: 'ネットワークエラーが発生しました' } };
    }
  }

  /**
   * リフレッシュトークンを使用してアクセストークンを更新
   */
  private static async refreshToken(): Promise<{ success: boolean }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false };
      }

      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('✅ Token refreshed successfully');
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  }

  /**
   * ログイン画面に遷移
   */
  private static redirectToLogin(): void {
    // トークンをクリア
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // ログイン画面に遷移
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * GET リクエスト
   */
  static async get<T = any>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST リクエスト
   */
  static async post<T = any>(endpoint: string, data?: any, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT リクエスト
   */
  static async put<T = any>(endpoint: string, data?: any, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE リクエスト
   */
  static async delete<T = any>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
