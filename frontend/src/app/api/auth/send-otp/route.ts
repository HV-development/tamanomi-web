import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { mergeSessionData, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session-encryption'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { isSecureRequest } from '@/lib/token-cookie'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    const fullUrl = buildApiUrl('/otp/send')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: { requireAuth: false },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Send OTP API error:', errorData)
      return createNoCacheResponse(
        { error: errorData.message || 'OTP送信に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const res = createNoCacheResponse(data)

    // セッションにOTP用データを保存（メールアドレスをURLパラメータに含めないためのセキュリティ対策）
    try {
      const encrypted = mergeSessionData(
        request.cookies.get(COOKIE_NAME)?.value,
        { otpEmail: email, otpRequestId: data.requestId }
      )
      res.cookies.set(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: isSecureRequest(request),
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      })
    } catch (error) {
      console.error('❌ [send-otp] Error saving session:', error)
      // セッション保存に失敗してもOTP送信は成功しているので、エラーを返さない
    }

    return res
  } catch (error) {
    console.error('Send OTP API fetch error:', error)
    return createNoCacheResponse(
      { error: 'OTP送信処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
