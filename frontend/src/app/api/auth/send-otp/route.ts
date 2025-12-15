import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { encrypt, decrypt, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session-encryption'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/otp/send')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // OTP送信は認証不要
      },
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

    // セキュリティ改善：メールアドレスをURLパラメータで送信しないため、サーバーサイドセッションに保存
    // OTP検証時にrequestIdからメールアドレスを取得できるようにする
    const res = createNoCacheResponse(data)

    // セッションにメールアドレスとrequestIdを保存（OTP検証用）
    // 共通のセッション暗号化ユーティリティを使用
    try {
      // 既存のセッションデータを取得
      let existingData: Record<string, unknown> = {}
      const sessionCookie = request.cookies.get(COOKIE_NAME)
      
      if (sessionCookie?.value) {
        try {
          const decrypted = decrypt(sessionCookie.value)
          existingData = JSON.parse(decrypted)
        } catch {
          // 復号化に失敗した場合は新しいセッションを開始
          existingData = {}
        }
      }

      // メールアドレスとrequestIdを保存
      existingData['otpEmail'] = email
      existingData['otpRequestId'] = data.requestId

      // 暗号化してCookieに保存
      const encrypted = encrypt(JSON.stringify(existingData))
      
      const isSecure = (() => {
        try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
      })()

      res.cookies.set(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      })

      console.log('✅ [send-otp] Session saved:', {
        email: email,
        requestId: data.requestId,
        cookieSet: true
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
