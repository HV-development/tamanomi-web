/**
 * ナビゲーション関連の型定義
 */

/**
 * アプリケーション全体のビュータイプ
 */
export type ViewType =
  | "home"
  | "login"
  | "email-registration"
  | "signup"
  | "confirmation"
  | "subscription"
  | "mypage"
  | "password-reset"
  | "email-confirmation"
  | "coupon-confirmation"
  | "usage-guide"

/**
 * マイページ内のビュータイプ
 */
export type MyPageViewType =
  | "main"
  | "profile-edit"
  | "email-change"
  | "password-change"
  | "usage-history"
  | "payment-history"
  | "plan-management"
  | "plan-change"
  | "withdrawal"
  | "withdrawal-complete"
  | "store-introduction"

