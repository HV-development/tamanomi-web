import type {
  PayPayPaymentResponse,
  PayPayGetTransactionResponse,
} from '@hv-development/schemas'

/**
 * 支払い方法種別
 * - CreditCard: クレジットカード決済
 * - AeonPay: イオンペイ（QRコード決済）
 * - PayPay: PayPay（QRコード決済）
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
   * - 決済ステータスが`PROCESSING`または`REQUIRES_ACTION`の場合に存在する可能性がある
   */
  redirectHtml?: string
}

/**
 * PayPay取引情報取得レスポンスのラッパー
 */
export interface PayPayTransactionStatusResponse {
  paymentTransactionId?: string | null
  applicationId?: string
  result: PayPayGetTransactionResponse
}

