import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/users/me/usage-history')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [usage-history] Backend API error:', data)
      
      // 401または403エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401 || response.status === 403) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          // リフレッシュトークンでトークン更新
          const refreshUrl = buildApiUrl('/auth/refresh')
          const refreshResponse = await secureFetchWithCommonHeaders(request, refreshUrl, {
            method: 'POST',
            headerOptions: {
              requireAuth: false, // リフレッシュトークンは認証不要
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            
            // リフレッシュ成功、新しいトークンで元のリクエストを再試行
            const newAuthHeader = `Bearer ${refreshData.accessToken}`
            const retryResponse = await secureFetchWithCommonHeaders(request, fullUrl, {
              method: 'GET',
              headerOptions: {
                requireAuth: true,
                customHeaders: {
                  'Authorization': newAuthHeader,
                },
              },
            })
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              // リフレッシュされたトークンをCookieに反映
              const res = createNoCacheResponse(retryData, { status: 200 })
              const isSecure = (() => {
                try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
              })()
              
              // 新しいトークンをCookieに設定
              if (refreshData.accessToken) {
                res.cookies.set('accessToken', refreshData.accessToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
                })
                res.cookies.set('__Host-accessToken', refreshData.accessToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
                })
              }
              if (refreshData.refreshToken) {
                res.cookies.set('refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
                })
                res.cookies.set('__Host-refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
                })
              }
              
              return res
            }
          }
        }
      }
      
      return createNoCacheResponse(
        { error: data.message || data.error?.message || '利用履歴の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [usage-history] Route error:', error)
    return createNoCacheResponse(
      { error: '利用履歴の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
