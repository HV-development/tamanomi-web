import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = searchParams.get('limit') || '50'
    const saitamaAppLinked = searchParams.get('saitamaAppLinked')

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      status,
      limit,
    })

    if (saitamaAppLinked !== null) {
      queryParams.append('saitamaAppLinked', saitamaAppLinked)
    }

    const fullUrl = `${buildApiUrl('/plans')}?${queryParams.toString()}`

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: false, // プラン一覧は認証不要（公開エンドポイント）
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Plans API error:', errorData)
      return createNoCacheResponse(
        { error: errorData.message || 'プランの取得に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Plans API fetch error:', error)
    return createNoCacheResponse(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
