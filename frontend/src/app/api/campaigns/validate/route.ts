import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return createNoCacheResponse(
        { error: 'コードを入力してください' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/campaigns/validate')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify({ code }),
    })

    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return createNoCacheResponse(data, { status: response.status })
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Campaign validate API fetch error:', error)
    return createNoCacheResponse(
      { error: 'キャンペーンコードの検証中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
