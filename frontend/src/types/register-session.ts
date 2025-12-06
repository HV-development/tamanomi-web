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

export interface RegisterSessionData {
  registerEmail?: string
  registerFormData?: Record<string, unknown>
  referrerUserId?: string
  userEmail?: string
  editFormData?: Record<string, unknown>
}



