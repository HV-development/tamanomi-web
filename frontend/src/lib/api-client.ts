import type {
  PayPayPaymentStartResponse,
  PayPayTransactionStatusResponse,
} from '@/types/payment'
import type { PayPayPaymentRequest, QrPaymentRequest, QrPaymentResponse, QrGetTransactionResponse } from '@hv-development/schemas'

/**
 * API呼び出しの共通処理
 * トークン期限切れ時の自動リフレッシュとログイン画面遷移を処理
 */

interface ApiResponse<T = unknown> {
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
  // NEXT_PUBLIC_API_BASE_URL は廃止。フロントからは Next API への相対パスを利用する。
  private static baseUrl = '';

  /**
   * API呼び出しの共通処理
   */
  static async request<T = unknown>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      requireAuth = true,
      autoRefresh: _autoRefresh = true,
      headers = {},
      ...fetchOptions
    } = options;

    // 認証が必要な場合、Cookieベースの認証を使用（localStorageは廃止）
    // credentials: 'include'でCookieから自動的に認証される

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include', // Cookieを送信
        ...fetchOptions,
      });

      // トークン期限切れの場合（Cookieベースの認証ではリフレッシュは不要）
      if (response.status === 403 && requireAuth) {
        // Cookieベースの認証では、403エラー時はログイン画面に遷移
        this.redirectToLogin();
        return { error: { code: 'AUTHENTICATION_FAILED', message: '認証に失敗しました' } };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || { code: 'API_ERROR', message: 'API呼び出しに失敗しました' } };
      }

      return { data: await response.json() };
    } catch {
      return { error: { code: 'NETWORK_ERROR', message: 'ネットワークエラーが発生しました' } };
    }
  }

  /**
   * ログイン画面に遷移
   * Cookieベースの認証では、トークンのクリアは不要（サーバー側でCookieを削除）
   */
  private static redirectToLogin(): void {
    // ログイン画面に遷移
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * GET リクエスト
   */
  static async get<T = unknown>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST リクエスト
   */
  static async post<T = unknown>(endpoint: string, data?: unknown, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT リクエスト
   */
  static async put<T = unknown>(endpoint: string, data?: unknown, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE リクエスト
   */
  static async delete<T = unknown>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * PayPay決済申込API
 * - Next API `/api/payment/paypay/pay` を経由してバックエンドのPayPay決済申込エンドポイントを呼び出す
 */
export async function requestPayPayPayment(
  body: PayPayPaymentRequest
): Promise<ApiResponse<PayPayPaymentStartResponse>> {
  return ApiClient.post<PayPayPaymentStartResponse>('/api/payment/paypay/pay', body, {
    requireAuth: true,
  })
}

/**
 * PayPay取引情報取得API
 * - Next API `/api/payment/paypay/transactions/:transactionId` を経由してバックエンドの取引情報取得エンドポイントを呼び出す
 */
export async function getPayPayTransactionStatus(
  transactionId: string
): Promise<ApiResponse<PayPayTransactionStatusResponse>> {
  return ApiClient.get<PayPayTransactionStatusResponse>(
    `/api/payment/paypay/transactions/${encodeURIComponent(transactionId)}`,
    { requireAuth: true },
  )
}

/**
 * イオンペイ決済申込API
 * - Next API `/api/payment/qr/pay` を経由してバックエンドのQRコード決済申込エンドポイントを呼び出す
 */
export async function requestQrPayment(
  body: QrPaymentRequest
): Promise<ApiResponse<QrPaymentResponse>> {
  return ApiClient.post<QrPaymentResponse>('/api/payment/qr/pay', body, {
    requireAuth: true,
  })
}

/**
 * QRコード決済 取引情報取得API
 * - Next API `/api/payment/qr/transactions/:transactionId` を経由してバックエンドの取引情報取得エンドポイントを呼び出す
 */
export async function getQrTransaction(
  transactionId: string,
  recursive?: boolean
): Promise<ApiResponse<QrGetTransactionResponse & { paymentTransactionId?: string; applicationId?: string }>> {
  const queryParams = recursive ? '?recursive=true' : ''
  return ApiClient.get<QrGetTransactionResponse & { paymentTransactionId?: string; applicationId?: string }>(
    `/api/payment/qr/transactions/${transactionId}${queryParams}`,
    {
      requireAuth: true,
    }
  )
}

/**
 * 認証関連のAPI関数
 */

export interface PreRegisterRequest {
  email: string
  campaignCode?: string
  shop_id?: string
}

export interface PreRegisterResponse {
  success: boolean
  message: string
}

/**
 * メールアドレスの事前登録APIを呼び出す
 * 登録確認メールが送信される
 */
export async function preRegister(
  email: string,
  campaignCode?: string,
  referrerUserId?: string,
  shopId?: string
): Promise<PreRegisterResponse> {
  try {
    const requestBody = {
      email,
      campaignCode,
      ...(referrerUserId && referrerUserId.trim() !== '' ? { referrerUserId: referrerUserId.trim() } : {}),
      ...(shopId && shopId.trim() !== '' ? { shopId: shopId.trim() } : {}),
    };

    const response = await fetch('/api/auth/pre-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // 409エラー（メールアドレス重複）の場合は特別なメッセージ
      if (response.status === 409) {
        const message = errorData.error?.message || errorData.message || 'このメールアドレスは既に登録されています。ログイン画面からログインしてください。'
        throw new Error(message)
      }

      // 400エラー（バリデーションエラー）の場合は詳細なメッセージを表示
      if (response.status === 400) {
        const message = errorData.error?.message || errorData.message || '入力内容に問題があります。確認してから再度お試しください。'
        throw new Error(message)
      }

      // 500エラー（サーバーエラー）の場合は一般的なメッセージを表示
      if (response.status === 500) {
        const message = errorData.error?.message || errorData.message || 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。'
        throw new Error(message)
      }

      const message = errorData.error?.message || errorData.message || '認証メールの送信に失敗しました'
      throw new Error(message)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('認証メールの送信中にエラーが発生しました')
  }
}

/**
 * パスワードリセット確認APIのレスポンス型
 */
export interface ConfirmPasswordResetResponse {
  success: boolean
  message?: string
}

/**
 * パスワードリセットを確認し、新しいパスワードを設定する
 * リセットトークンと新しいパスワードを使用してパスワードをリセットする
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<ConfirmPasswordResetResponse> {
  try {
    const response = await fetch('/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // 400エラー（無効なトークンなど）の場合は特別なメッセージ
      if (response.status === 400) {
        const message = errorData.message || errorData.error?.message || '無効なリセットトークンです。リンクの有効期限が切れている可能性があります。'
        throw new Error(message)
      }

      // 408エラー（タイムアウト）の場合は特別なメッセージ
      if (response.status === 408) {
        const message = errorData.message || errorData.error?.message || 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。'
        throw new Error(message)
      }

      // 503エラー（サーバー接続エラー）の場合は特別なメッセージ
      if (response.status === 503) {
        const message = errorData.message || errorData.error?.message || 'サーバーに接続できません。ネットワーク接続を確認してください。'
        throw new Error(message)
      }

      // 500エラー（サーバーエラー）の場合は一般的なメッセージを表示
      if (response.status === 500) {
        const message = errorData.message || errorData.error?.message || 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。'
        throw new Error(message)
      }

      const message = errorData.message || errorData.error?.message || 'パスワードリセットに失敗しました'
      throw new Error(message)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('パスワードリセットの処理中にエラーが発生しました')
  }
}
