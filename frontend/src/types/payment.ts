import type {
  PayPayPaymentResponse,
  PayPayGetTransactionResponse,
} from '@hv-development/schemas'

/**
 * 支払い方法種別
 * - 現時点で有効なのは CreditCard と PayPay
 * - AeonPay はUI上のみ表示し、「準備中」として扱う
 */
export type PaymentMethodType = 'CreditCard' | 'AeonPay' | 'PayPay'

/**
 * 単発プラン決済開始リクエスト（フロントエンド → 自社API）
 */
export interface OneTimePlanPaymentRequest {
  planId: string
  paymentMethod: PaymentMethodType
}

/**
 * PayPay決済申込レスポンス（自社API → フロントエンド）
 * redirectHtml には PayPayの支払い画面を表示するためのHTML断片が含まれる想定
 */
export interface PayPayPaymentStartResponse {
  paymentTransactionId: string
  applicationId: string
  requestId?: string
  status: PayPayPaymentResponse['status']
  resultCode?: string | number
  resultDescription?: string
  transactionId?: string
  receivedTime?: string
  resultProperty?: Record<string, unknown> | null
  /**
   * PayPay支払い画面を表示するためのHTML
   * - `dangerouslySetInnerHTML` で描画する想定
   */
  redirectHtml: string
}

/**
 * PayPay取引情報取得レスポンスのラッパー
 */
export interface PayPayTransactionStatusResponse {
  paymentTransactionId?: string | null
  applicationId?: string
  result: PayPayGetTransactionResponse
}



