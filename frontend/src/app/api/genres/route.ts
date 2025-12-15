/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

// サーバーサイドなので NEXT_PUBLIC_ なしの環境変数を使用
// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 公開エンドポイント（認証不要）
    // バックエンドのエンドポイントは /api/v1/genres（server.tsで登録されている）
    const backendUrl = `${API_BASE_URL}/api/v1/genres`

    const response = await secureFetchWithCommonHeaders(request, backendUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: false, // ジャンル一覧は認証不要（公開エンドポイント）
      },
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // 500系は文言を統一
      if (response.status >= 500) {
        return createNoCacheResponse(
          {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'ジャンル情報の取得に失敗しました。時間を置いて再度お試しください。',
            },
          },
          { status: 500 }
        )
      }

      // 4xx などはバックエンドのエラーをそのまま返す
      return createNoCacheResponse(
        {
          error: data?.error || {
            code: 'API_ERROR',
            message: data?.message || 'ジャンル情報の取得に失敗しました',
          },
        },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api/genres] network error:', message)
    return createNoCacheResponse(
      {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました',
          detail: message,
        },
      },
      { status: 500 }
    )
  }
}
