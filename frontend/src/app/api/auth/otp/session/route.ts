import { NextRequest } from 'next/server'
import { decrypt, COOKIE_NAME } from '@/lib/session-encryption'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

/**
 * CookieからOTPセッション情報（メールアドレスとrequestId）を取得
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return createNoCacheResponse(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    try {
      const decrypted = decrypt(sessionCookie.value)
      const sessionData = JSON.parse(decrypted) as Record<string, unknown>
      
      const otpEmail = sessionData['otpEmail'] as string | undefined
      const otpRequestId = sessionData['otpRequestId'] as string | undefined

      if (!otpEmail || !otpRequestId) {
        return createNoCacheResponse(
          { error: 'OTPセッション情報が見つかりません' },
          { status: 404 }
        )
      }

      return createNoCacheResponse({
        email: otpEmail,
        requestId: otpRequestId,
      })
    } catch (error) {
      console.error('Failed to decrypt session:', error)
      return createNoCacheResponse(
        { error: 'セッションの復号化に失敗しました' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Get OTP session error:', error)
    return createNoCacheResponse(
      { error: 'セッション情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


