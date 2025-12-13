import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetch } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    const headers: HeadersInit = {}
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const fullUrl = buildApiUrl('/logout')
    const response = await secureFetch(fullUrl, {
      method: 'POST',
      headers,
    })

    const ok = response.ok
    const nextResponse = createNoCacheResponse(
      ok ? { message: 'Logout successful' } : { message: 'Logout locally cleared', upstream: response.status }
    )
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
    })()
    
    // accessToken クッキーを削除
    nextResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    nextResponse.cookies.set('__Host-accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    
    // refreshToken クッキーを削除
    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    nextResponse.cookies.set('__Host-refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    
    return nextResponse
  } catch (error: unknown) {
    console.error('❌ API Route: Logout error', error)
    const res = createNoCacheResponse({ message: 'Local logout executed' }, { status: 200 })
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
    })()
    
    res.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    res.cookies.set('__Host-accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    res.cookies.set('__Host-refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
    return res
  }
}
