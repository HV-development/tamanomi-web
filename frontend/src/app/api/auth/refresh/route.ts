import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { setTokenCookies, isSecureRequest } from '@/lib/token-cookie'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request)

    if (!refreshToken) {
      return createNoCacheResponse(
        { error: 'リフレッシュトークンが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/refresh')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false,
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

    const res = createNoCacheResponse({ message: 'Token refresh successful' })
    res.headers.set('Cache-Control', 'no-store')
    res.headers.set('Pragma', 'no-cache')

    const isSecure = isSecureRequest(request)
    setTokenCookies(res, data, isSecure)

    return res
  } catch (error) {
    console.error('❌ [refresh] Route error:', error)
    return createNoCacheResponse(
      { error: 'トークンのリフレッシュ中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
