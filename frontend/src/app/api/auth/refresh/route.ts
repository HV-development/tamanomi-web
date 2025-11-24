import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Cookieからリフレッシュトークンを取得
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'リフレッシュトークンが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/auth/refresh')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })


    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [refresh] Backend API error:', data)
      return NextResponse.json(
        { error: data.message || data.error?.message || 'トークンのリフレッシュに失敗しました' },
        { status: response.status }
      )
    }


    // トークンをhttpOnly Cookieに保存し、ボディでは返却しない
    const res = NextResponse.json({ message: 'Token refresh successful' })
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
    })()
    
    res.headers.set('Cache-Control', 'no-store')
    res.headers.set('Pragma', 'no-cache')
    
    if (data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15, // 15分
      })
      res.cookies.set('__Host-accessToken', data.accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15,
      })
    }
    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30日
      })
      res.cookies.set('__Host-refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    
    return res
  } catch (error) {
    console.error('❌ [refresh] Route error:', error)
    return NextResponse.json(
      { error: 'トークンのリフレッシュ中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

