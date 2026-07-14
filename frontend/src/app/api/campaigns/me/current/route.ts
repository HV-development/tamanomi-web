import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/campaigns/me/current')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true,
      },
    })

    if (response.status === 401) {
      return createNoCacheResponse({ error: '認証が必要です' }, { status: 401 })
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return createNoCacheResponse(data, { status: response.status })
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Campaigns me/current API fetch error:', error)
    return createNoCacheResponse(
      { error: 'キャンペーン情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
