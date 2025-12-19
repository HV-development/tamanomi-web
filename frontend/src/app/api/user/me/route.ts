import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // デバッグログ: Cookieの存在確認
    const accessTokenCookie = request.cookies.get('accessToken');
    const hostAccessTokenCookie = request.cookies.get('__Host-accessToken');
    const refreshTokenCookie = request.cookies.get('refreshToken');
    const hostRefreshTokenCookie = request.cookies.get('__Host-refreshToken');
    
    console.log('🔍 [user/me] Cookie check:', {
      hasAccessToken: !!accessTokenCookie?.value,
      hasHostAccessToken: !!hostAccessTokenCookie?.value,
      hasRefreshToken: !!refreshTokenCookie?.value,
      hasHostRefreshToken: !!hostRefreshTokenCookie?.value,
      cookieHeader: request.headers.get('cookie')?.substring(0, 100) || 'none',
    });

    const fullUrl = buildApiUrl('/users/me')

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
      console.error('❌ [user/me] Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        url: fullUrl,
      })
      
      // 401または403エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401 || response.status === 403) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          // リフレッシュトークンでトークン更新（直接backend APIを呼び出す）
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
                // 通常のCookie（開発環境・本番環境の両方で動作）
                res.cookies.set('accessToken', refreshData.accessToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
                })
                // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
                if (isSecure) {
                  res.cookies.set('__Host-accessToken', refreshData.accessToken, {
                    httpOnly: true,
                    secure: true, // __Host-プレフィックスにはsecure: trueが必須
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 2, // 2時間（バックエンドのJWT_ACCESS_TOKEN_EXPIRES_INに合わせる）
                  })
                }
              }
              if (refreshData.refreshToken) {
                // 通常のCookie（開発環境・本番環境の両方で動作）
                res.cookies.set('refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
                })
                // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
                if (isSecure) {
                  res.cookies.set('__Host-refreshToken', refreshData.refreshToken, {
                    httpOnly: true,
                    secure: true, // __Host-プレフィックスにはsecure: trueが必須
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7, // 7日（バックエンドのJWT_REFRESH_TOKEN_EXPIRES_INに合わせる）
                  })
                }
              }
              
              return res
            } else {
              // リトライが失敗した場合、403エラーがアカウントタイプ不一致の可能性がある
              const retryData = await retryResponse.json().catch(() => ({}))
              if (retryResponse.status === 403 && retryData.message?.includes('アカウントタイプ')) {
                return createNoCacheResponse(
                  { error: 'この機能はユーザーアカウント専用です' },
                  { status: 403 }
                )
              }
            }
          }
        }
        
        // リフレッシュに失敗した場合、403エラーがアカウントタイプ不一致の可能性がある
        if (response.status === 403) {
          const errorMessage = data.message || data.error?.message || ''
          if (errorMessage.includes('アカウントタイプ') || errorMessage.includes('account type')) {
            return createNoCacheResponse(
              { error: 'この機能はユーザーアカウント専用です' },
              { status: 403 }
            )
          }
        }
      }
      
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'ユーザー情報の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [user/me] Route error:', error)
    return createNoCacheResponse(
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
