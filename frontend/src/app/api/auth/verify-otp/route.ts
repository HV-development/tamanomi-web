import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/lib/cookie-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, requestId } = body

    const fullUrl = buildApiUrl('/otp/verify')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // OTP検証は認証不要
      },
      body: JSON.stringify({ email, otp, requestId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      

      return createNoCacheResponse(
        { error: errorData.error?.message || errorData.message || 'OTP検証に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // トークンをhttpOnly Cookieに保存し、ボディでは返却しない
    const res = createNoCacheResponse({ message: 'OTP verification successful' })
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
    })()
    
    if (data.accessToken) {
      // 旧Cookie（プレフィックス無し）を削除して衝突を解消
      res.cookies.set('accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
      res.cookies.set('__Host-accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })

      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, data.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN, // バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set(COOKIE_NAMES.HOST_ACCESS_TOKEN, data.accessToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN, // バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる
        })
      }
    }
    if (data.refreshToken) {
      // 旧Cookie（プレフィックス無し）を削除して衝突を解消
      res.cookies.set('refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
      res.cookies.set('__Host-refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })

      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN, // バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set(COOKIE_NAMES.HOST_REFRESH_TOKEN, data.refreshToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN, // バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる
        })
      }
    }
    
    return res
  } catch {
    return createNoCacheResponse(
      { error: 'OTP検証処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
