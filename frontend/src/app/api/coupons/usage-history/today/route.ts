import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

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

    const url = new URL(request.url)
    const shopId = url.searchParams.get('shopId')
    
    if (!shopId) {
      return createNoCacheResponse(
        { error: 'shopIdパラメータが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/coupons/usage-history/today?shopId=${encodeURIComponent(shopId)}`)

    const response = await secureFetchWithAuth(fullUrl, authHeader, { method: 'GET' })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [usage-history/today] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.message || data.error?.message || '使用履歴の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [usage-history/today] Route error:', error)
    return createNoCacheResponse(
      { error: '使用履歴の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
