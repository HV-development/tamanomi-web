import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, planId, customerFamilyName, customerName, companyName } = body


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

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 認証が必要（デフォルト）
      },
      body: JSON.stringify(backendRequestBody),
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment register API error:', errorData)
      return createNoCacheResponse(
        { error: errorData.message || 'カード登録の準備に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Payment register API fetch error:', error)
    return createNoCacheResponse(
      { error: 'カード登録の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
