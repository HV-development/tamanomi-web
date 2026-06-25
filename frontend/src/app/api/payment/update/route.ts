import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userPlanId,
      customerId,
      customerCardId,
      planId,
      runningId,
      tradingId,
      amount, // プラン変更時の金額
      endScheduled, // 退会時の課金終了日（YYYYMMDD形式）
      description
    } = body

    const fullUrl = buildApiUrl('/payment/update')

    if (
      typeof userPlanId !== 'string' ||
      userPlanId.length === 0 ||
      userPlanId.length > 64
    ) {
      return createNoCacheResponse(
        { error: 'userPlanId（ユーザープランID）を指定してください。' },
        { status: 400 }
      )
    }

    // amountもendScheduledも指定されていない場合はエラー
    if (amount === undefined && endScheduled === undefined) {
      return createNoCacheResponse(
        { error: 'amount（プラン変更時）またはendScheduled（退会時）のいずれかを指定してください。' },
        { status: 400 }
      )
    }

    // runningIdまたはtradingIdのいずれかが必要
    if (!runningId && !tradingId) {
      return createNoCacheResponse(
        { error: 'runningIdまたはtradingIdのいずれかが必要です。' },
        { status: 400 }
      )
    }

    // undefinedのフィールドを除外してバックエンドに送信
    // セキュリティ改善：userEmailはバックエンドで認証トークンから取得するため、フロントエンドから送信しない
    const backendRequestBody: Record<string, unknown> = {
      userPlanId,
    }

    if (customerId) {
      backendRequestBody.customerId = customerId
    }

    if (customerCardId) {
      backendRequestBody.customerCardId = customerCardId
    }

    if (planId) {
      backendRequestBody.planId = planId
    }

    if (runningId) {
      backendRequestBody.runningId = runningId
    }

    if (tradingId) {
      backendRequestBody.tradingId = tradingId
    }

    if (amount !== undefined) {
      backendRequestBody.amount = amount
    }

    if (endScheduled) {
      backendRequestBody.endScheduled = endScheduled
    }

    if (description) {
      backendRequestBody.description = description
    }

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify(backendRequestBody),
    })

    return response
  } catch (error) {
    console.error('Payment update API fetch error:', error)
    return createNoCacheResponse(
      { error: '継続課金変更中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
