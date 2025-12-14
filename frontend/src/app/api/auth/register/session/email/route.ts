import { NextRequest } from 'next/server'
import { decrypt, COOKIE_NAME } from '@/lib/session-encryption'
import { createNoCacheResponse } from '@/lib/response-utils'

/**
 * セッションデータの型定義
 */
interface RegisterSessionData {
  registerEmail?: string
  registerFormData?: Record<string, unknown>
  referrerUserId?: string
  userEmail?: string
  editFormData?: Record<string, unknown>
  otpEmail?: string // OTP認証用のメールアドレス
  otpRequestId?: string // OTP認証用のrequestId
}

/**
 * GET: メールアドレス関連のフィールドのみを取得（OTP認証など、必要な場合のみ使用）
 * セキュリティ改善：通常のGETエンドポイントではメールアドレスを返さないが、
 * OTP認証など、内部処理でメールアドレスが必要な場合にのみ使用する
 * 
 * クエリパラメータ:
 * - key: 取得するフィールド名（'registerEmail' | 'userEmail' | 'otpEmail'）
 * - requestId: OTP認証の場合、requestIdを指定して検証（otpEmail取得時のみ必須）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key') as 'registerEmail' | 'userEmail' | 'otpEmail' | null
    const requestId = searchParams.get('requestId') || null

    if (!key || !['registerEmail', 'userEmail', 'otpEmail'].includes(key)) {
      return createNoCacheResponse(
        { error: { code: 'INVALID_KEY', message: '有効なキーを指定してください' } },
        { status: 400 }
      )
    }

    // otpEmail取得時はrequestIdの検証を必須とする
    if (key === 'otpEmail' && !requestId) {
      return createNoCacheResponse(
        { error: { code: 'MISSING_REQUEST_ID', message: 'requestIdが必要です' } },
        { status: 400 }
      )
    }

    const sessionCookie = request.cookies.get(COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return createNoCacheResponse({ data: null })
    }
    
    try {
      const decrypted = decrypt(sessionCookie.value)
      const data = JSON.parse(decrypted) as RegisterSessionData
      
      // otpEmail取得時はrequestIdの一致を確認
      if (key === 'otpEmail') {
        if (data.otpRequestId !== requestId) {
          return createNoCacheResponse(
            { error: { code: 'INVALID_REQUEST_ID', message: 'requestIdが一致しません' } },
            { status: 403 }
          )
        }
      }
      
      // 指定されたキーのみを返す
      const value = data[key] || null
      return createNoCacheResponse({ data: value })
    } catch {
      // 復号化に失敗した場合は空のデータを返す
      return createNoCacheResponse({ data: null })
    }
  } catch (error) {
    console.error('Session email GET error:', error)
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    )
  }
}
