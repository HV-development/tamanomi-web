import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '100'
    const status = searchParams.get('status') || 'pending'  // デフォルトを申請中に
    const isPublic = searchParams.get('isPublic') || 'false'  // デフォルトを非公開に

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      page,
      limit,
      status,
      isPublic,
    })
    
    if (shopId) {
      queryParams.append('shopId', shopId)
    }

    const authHeader = getAuthHeader(request)
    
    const fullUrl = `${buildApiUrl('/coupons')}?${queryParams.toString()}`

    // 認証がオプショナルなので、authorizationがあるかどうかでrequireAuthを設定
    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: !!authHeader, // 認証ヘッダーがある場合のみ認証が必要
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [coupons] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'クーポンの取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [coupons] Route error:', error)
    return createNoCacheResponse(
      { error: 'クーポンの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
