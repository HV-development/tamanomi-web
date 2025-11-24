import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, requestId } = body

    const fullUrl = buildApiUrl('/otp/verify')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, requestId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      

      return NextResponse.json(
        { error: errorData.error?.message || errorData.message || 'OTP検証に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // トークンをhttpOnly Cookieに保存し、ボディでは返却しない
    const res = NextResponse.json({ message: 'OTP verification successful' })
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
  } catch {
    return NextResponse.json(
      { error: 'OTP検証処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

