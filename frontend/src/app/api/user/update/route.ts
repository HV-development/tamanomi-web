import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    if (!body.nickname || !body.postalCode || !body.address || !body.birthDate || !body.gender) {
      return createNoCacheResponse(
        { success: false, message: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    // バックエンドAPIを呼び出し
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/users/me')

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'PUT',
        headerOptions: {
          requireAuth: true, // 認証が必要
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      // 認証エラーの場合は401を返す
      if (response.status === 401) {
        return createNoCacheResponse(
          { success: false, message: '認証が必要です' },
          { status: 401 }
        )
      }

      clearTimeout(timeoutId)

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // エラーメッセージを返す
        let errorMessage = 'プロフィール更新に失敗しました'
        
        if (response.status === 401) {
          errorMessage = '認証エラー: ログインしてください'
        } else if (response.status === 403) {
          errorMessage = '更新する権限がありません'
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }

        return createNoCacheResponse(
          {
            success: false,
            message: errorMessage,
            error: errorData,
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      return createNoCacheResponse({ success: true, data }, { status: response.status })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error('❌ [user/update] Error:', error)
    return createNoCacheResponse(
      { success: false, message: 'プロフィール更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
