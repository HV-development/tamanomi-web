import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
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

    const fullUrl = buildApiUrl('/auth/refresh')

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
      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set('__Host-accessToken', data.accessToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
        })
      }
    }
    if (data.refreshToken) {
      // 通常のCookie（開発環境・本番環境の両方で動作）
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
      })
      // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
      if (isSecure) {
        res.cookies.set('__Host-refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: true, // __Host-プレフィックスにはsecure: trueが必須
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
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
