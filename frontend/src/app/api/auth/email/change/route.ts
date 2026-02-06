import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/lib/cookie-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    if (!body.currentPassword || !body.newEmail || !body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '現在のパスワード、新しいメールアドレス、確認メールアドレスは必須です' } },
        { status: 400 }
      )
    }

    // メールアドレスの一致確認
    if (body.newEmail !== body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '新しいメールアドレスと確認メールアドレスが一致しません' } },
        { status: 400 }
      )
    }

    // バックエンドAPIに転送
    const fullUrl = buildApiUrl('/email/change')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: true,
        },
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newEmail: body.newEmail,
          confirmEmail: body.confirmEmail,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 認証エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          // リフレッシュトークンでトークン更新
          const refreshUrl = buildApiUrl('/refresh')
          const refreshResponse = await secureFetchWithCommonHeaders(request, refreshUrl, {
            method: 'POST',
            headerOptions: {
              requireAuth: false,
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            
            // 新しいトークンで元のリクエストを再試行
            const newAuthHeader = `Bearer ${refreshData.accessToken}`
            const retryResponse = await secureFetchWithCommonHeaders(request, fullUrl, {
              method: 'POST',
              headerOptions: {
                requireAuth: true,
                customHeaders: {
                  'Authorization': newAuthHeader,
                },
              },
              body: JSON.stringify({
                currentPassword: body.currentPassword,
                newEmail: body.newEmail,
                confirmEmail: body.confirmEmail,
              }),
            })
            
            const retryData = await retryResponse.json()
            
            if (retryResponse.ok) {
              // リフレッシュされたトークンをCookieに反映
              const res = createNoCacheResponse(retryData)
              const isSecure = (() => {
                try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
              })()
              
              // 新しいトークンをCookieに設定
              if (refreshData.accessToken) {
                res.cookies.set('accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
                res.cookies.set('__Host-accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
                res.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, refreshData.accessToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
                })
                if (isSecure) {
                  res.cookies.set(COOKIE_NAMES.HOST_ACCESS_TOKEN, refreshData.accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
                  })
                }
              }
              if (refreshData.refreshToken) {
                res.cookies.set('refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
                res.cookies.set('__Host-refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 0 })
                res.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
                })
                if (isSecure) {
                  res.cookies.set(COOKIE_NAMES.HOST_REFRESH_TOKEN, refreshData.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
                  })
                }
              }
              
              return res
            }
            
            // リトライが失敗
            return createNoCacheResponse(
              { error: retryData.error || { message: 'メールアドレス変更に失敗しました' } },
              { status: retryResponse.status }
            )
          }
        }
        
        // リフレッシュに失敗した場合
        return createNoCacheResponse(
          { error: { message: '認証トークンが無効です。再度ログインしてください。' } },
          { status: 401 }
        )
      }

      const responseData = await response.json()

      if (!response.ok) {
        return createNoCacheResponse(
          { error: responseData.error || { message: 'メールアドレス変更に失敗しました' } },
          { status: response.status }
        )
      }

      return createNoCacheResponse(responseData)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return createNoCacheResponse(
          { error: { message: 'リクエストがタイムアウトしました' } },
          { status: 408 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Email change error:', error)
    return createNoCacheResponse(
      { error: { message: 'メールアドレス変更に失敗しました' } },
      { status: 500 }
    )
  }
}
