import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { saitamaAppId } = body

    if (!saitamaAppId || saitamaAppId.trim() === '') {
      return createNoCacheResponse(
        { error: 'さいたま市アプリIDを入力してください' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/users/me/link-saitama-app')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify({ saitamaAppId }),
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend API error:', data)
      return createNoCacheResponse(
        { error: data.error?.message || 'さいたま市アプリ連携に失敗しました' },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)

  } catch (error) {
    console.error('Link saitama app route error:', error)
    return createNoCacheResponse(
      { error: 'さいたま市アプリ連携中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
