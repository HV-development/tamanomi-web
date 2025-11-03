import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader, getRefreshToken } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '100'
    const status = searchParams.get('status') || 'active'
    const isPublic = searchParams.get('isPublic')

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      page,
      limit,
      status,
    })
    
    if (shopId) {
      queryParams.append('shopId', shopId)
    }
    
    if (isPublic) {
      queryParams.append('isPublic', isPublic)
    }

    console.log('🔍 [coupons] Query params:', { shopId, page, limit, status, isPublic })
    console.log('🔍 [coupons] Query string:', queryParams.toString())

    const authHeader = getAuthHeader(request)
    
    const fullUrl = `${buildApiUrl('/coupons')}?${queryParams.toString()}`
    console.log('🔍 [coupons] Calling backend API:', fullUrl)

    // 認証ヘッダーがある場合のみ追加
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    console.log('🔍 [coupons] Backend response status:', response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [coupons] Backend API error:', data)
      
      // 401エラーの場合、リフレッシュトークンで再試行
      if (response.status === 401) {
        const refreshToken = getRefreshToken(request)
        
        if (refreshToken) {
          console.log('🔄 [coupons] Attempting token refresh...')
          
          // リフレッシュトークンでトークン更新（直接backend APIを呼び出す）
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
            console.log('✅ [coupons] Token refresh successful')
            
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
        { error: data.message || data.error?.message || 'クーポンの取得に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('✅ [coupons] Backend response success:', {
      couponsCount: data.coupons?.length || 0,
      pagination: data.pagination
    })
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [coupons] Route error:', error)
    return NextResponse.json(
      { error: 'クーポンの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

