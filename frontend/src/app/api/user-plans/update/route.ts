import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
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
      const { response } = await authenticatedFetch(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: true,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
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
