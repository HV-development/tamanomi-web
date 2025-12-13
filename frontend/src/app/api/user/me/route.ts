import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader, getRefreshToken } from '@/lib/auth-header'
import { secureFetch, secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse, addNoCacheHeaders } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/users/me')

    const response = await secureFetchWithAuth(fullUrl, authHeader, { method: 'GET' })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [user/me] Backend API error:', data)
      
      // 401または403エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401 || response.status === 403) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          // リフレッシュトークンでトークン更新（直接backend APIを呼び出す）
          const refreshUrl = buildApiUrl('/auth/refresh')
          const refreshResponse = await secureFetch(refreshUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            
            // リフレッシュ成功、新しいトークンで元のリクエストを再試行
            const newAuthHeader = `Bearer ${refreshData.accessToken}`
            const retryResponse = await secureFetchWithAuth(fullUrl, newAuthHeader, { method: 'GET' })
            
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
                  maxAge: 60 * 15, // 15分
                })
                res.cookies.set('__Host-accessToken', refreshData.accessToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 15,
                })
              }
              if (refreshData.refreshToken) {
                res.cookies.set('refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 30, // 30日
                })
                res.cookies.set('__Host-refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: isSecure,
                  sameSite: 'strict',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 30,
                })
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
