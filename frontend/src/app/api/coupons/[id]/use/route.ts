import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { shopId } = body
    
    if (!shopId) {
      return createNoCacheResponse(
        { error: 'shopIdパラメータが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/coupons/${id}/use`)

    const response = await secureFetchWithAuth(fullUrl, authHeader, {
      method: 'POST',
      body: JSON.stringify({ shopId }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [coupons/[id]/use] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'クーポンの使用に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [coupons/[id]/use] Route error:', error)
    return createNoCacheResponse(
      { error: 'クーポンの使用中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
