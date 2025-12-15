import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/users/me/withdraw')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify({}),
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [user/withdraw] Backend API error:', data)
      return createNoCacheResponse(
        data,
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('❌ [user/withdraw] Route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '退会処理に失敗しました', details: errorMessage } },
      { status: 500 }
    )
  }
}
