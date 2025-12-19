/**
 * 登録セッションデータの型定義
 * httpOnly Cookieを使用してサーバーサイドでデータを保存する際の型
 */

export type RegisterSessionKey = 
  | 'registerEmail' 
  | 'registerFormData' 
  | 'referrerUserId' 
  | 'userEmail' 
  | 'editFormData'
  | 'otpEmail' // OTP認証用のメールアドレス
  | 'otpRequestId' // OTP認証用のrequestId

export interface RegisterSessionData {
  registerEmail?: string
  registerFormData?: Record<string, unknown>
  referrerUserId?: string
  userEmail?: string
  editFormData?: Record<string, unknown>
  otpEmail?: string // OTP認証用のメールアドレス
  otpRequestId?: string // OTP認証用のrequestId
}







