import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, planId, customerFamilyName, customerName, companyName, campaignCode } = body


    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/payment/register')

    // undefinedのフィールドを除外してバックエンドに送信
    // セキュリティ改善：userEmailはバックエンドで認証トークンから取得するため、フロントエンドから送信しない
    const backendRequestBody: Record<string, string> = {}

    if (customerId) {
      backendRequestBody.customerId = customerId
    }

    if (planId) {
      backendRequestBody.planId = planId
    }

    if (customerFamilyName) {
      backendRequestBody.customerFamilyName = customerFamilyName
    }

    if (customerName) {
      backendRequestBody.customerName = customerName
    }

    if (companyName) {
      backendRequestBody.companyName = companyName
    }

    // 多層防御: backend でも trim するが、BFF 側で早期に前後空白を弾く
    const trimmedCampaignCode = typeof campaignCode === 'string' ? campaignCode.trim() : undefined

    if (trimmedCampaignCode) {
      backendRequestBody.campaignCode = trimmedCampaignCode
    }

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify(backendRequestBody),
    })

    return response
  } catch (error) {
    console.error('Payment register API fetch error:', error)
    return createNoCacheResponse(
      { error: 'カード登録の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
