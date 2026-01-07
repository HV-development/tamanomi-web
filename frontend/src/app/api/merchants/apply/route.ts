import { NextRequest } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

// サーバーサイド用ベースURL
// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/api/v1/merchants/apply`, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // 事業者申し込みは認証不要
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status >= 500) {
        return createNoCacheResponse(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'お申し込みの処理に失敗しました。時間を置いて再度お試しください。' } },
          { status: 500 }
        )
      }
      return createNoCacheResponse(
        { error: data?.error || { code: 'API_ERROR', message: data?.message || 'お申し込みに失敗しました' } },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'ネットワークエラーが発生しました', detail: message } },
      { status: 500 }
    )
  }
}
