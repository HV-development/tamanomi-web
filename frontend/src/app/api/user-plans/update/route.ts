import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, alsoChangePaymentMethod } = body


    // バリデーション
    if (!planId) {
      console.warn('⚠️ [user-plans/update] planIdなし');
      return createNoCacheResponse(
        { success: false, message: 'プランIDは必須です' },
        { status: 400 }
      )
    }

    const requestBody = {
      planId: planId,
      alsoChangePaymentMethod: alsoChangePaymentMethod || false,
    };

    // バックエンドAPIを呼び出し
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/plans/user-plans/change')

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: true, // 認証が必要
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      // 認証エラーの場合は401を返す
      if (response.status === 401) {
        console.warn('⚠️ [user-plans/update] 認証ヘッダーなし');
        return createNoCacheResponse(
          { success: false, message: '認証が必要です' },
          { status: 401 }
        )
      }

      clearTimeout(timeoutId)


      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [user-plans/update] バックエンドAPIエラー:', errorData);

        // エラーメッセージを返す
        let errorMessage = 'プラン変更に失敗しました'

        if (response.status === 401) {
          errorMessage = '認証エラー: ログインしてください'
        } else if (response.status === 404) {
          errorMessage = '指定されたプランが見つかりません'
        } else if (response.status === 403) {
          errorMessage = 'このプランに変更する権限がありません'
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
      return createNoCacheResponse(data, { status: response.status })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error('❌ [user-plans/change] Error:', error)
    return createNoCacheResponse(
      { success: false, message: 'プラン変更中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
