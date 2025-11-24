import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader, getRefreshToken } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }


    const fullUrl = buildApiUrl('/users/me/usage-history')

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    })


    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [usage-history] Backend API error:', data)
      
      // 401エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          
          // リフレッシュトークンでトークン更新
          const refreshUrl = buildApiUrl('/auth/refresh')
          const refreshResponse = await fetch(refreshUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            
            // リフレッシュ成功、新しいトークンで元のリクエストを再試行
            const newAuthHeader = `Bearer ${refreshData.accessToken}`
            const retryResponse = await fetch(fullUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': newAuthHeader,
              },
              cache: 'no-store',
            })
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              // リフレッシュされたトークンをCookieに反映
              const res = NextResponse.json(retryData, { status: 200 })
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
            }
          }
        }
      }
      
      return NextResponse.json(
        { error: data.message || data.error?.message || '利用履歴の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [usage-history] Route error:', error)
    return NextResponse.json(
      { error: '利用履歴の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


