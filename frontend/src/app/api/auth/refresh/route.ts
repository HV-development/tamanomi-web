import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/lib/cookie-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Cookieからリフレッシュトークンを取得
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      return createNoCacheResponse(
        { error: 'リフレッシュトークンが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/refresh')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // リフレッシュトークンは認証不要
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [refresh] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'トークンのリフレッシュに失敗しました' },
        { status: response.status }
      )
    }

    // トークンをhttpOnly Cookieに保存し、ボディでは返却しない
    const res = createNoCacheResponse({ message: 'Token refresh successful' })
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
    })()

    res.headers.set('Cache-Control', 'no-store')
    res.headers.set('Pragma', 'no-cache')

    if (data.accessToken) {
      const accessTokenMaxAge = COOKIE_MAX_AGE.ACCESS_TOKEN;
      const accessTokenDays = accessTokenMaxAge / (60 * 60 * 24);
      console.log('🍪 [auth/refresh] アクセストークンCookie設定:', {
        maxAge: accessTokenMaxAge,
        days: accessTokenDays,
        hours: accessTokenMaxAge / (60 * 60),
        configValue: COOKIE_MAX_AGE.ACCESS_TOKEN,
      });
      
      // 旧Cookie（プレフィックス無し）を削除して衝突を解消
      res.cookies.set('accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
      res.cookies.set('__Host-accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })

      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, data.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: accessTokenMaxAge,
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set(COOKIE_NAMES.HOST_ACCESS_TOKEN, data.accessToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: accessTokenMaxAge,
        })
      }
    }
    if (data.refreshToken) {
      const refreshTokenMaxAge = COOKIE_MAX_AGE.REFRESH_TOKEN;
      const refreshTokenDays = refreshTokenMaxAge / (60 * 60 * 24);
      console.log('🍪 [auth/refresh] リフレッシュトークンCookie設定:', {
        maxAge: refreshTokenMaxAge,
        days: refreshTokenDays,
        hours: refreshTokenMaxAge / (60 * 60),
        configValue: COOKIE_MAX_AGE.REFRESH_TOKEN,
      });
      
      // 旧Cookie（プレフィックス無し）を削除して衝突を解消
      res.cookies.set('refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
      res.cookies.set('__Host-refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })

      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: refreshTokenMaxAge,
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set(COOKIE_NAMES.HOST_REFRESH_TOKEN, data.refreshToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: refreshTokenMaxAge,
        })
      }
    }

    return res
  } catch (error) {
    console.error('❌ [refresh] Route error:', error)
    return createNoCacheResponse(
      { error: 'トークンのリフレッシュ中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
