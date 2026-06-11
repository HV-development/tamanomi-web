import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify({ shopId }),
    })

    return response

  } catch (error) {
    console.error('❌ [coupons/[id]/use] Route error:', error)
    return createNoCacheResponse(
      { error: 'クーポンの使用中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
