import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/paypay/complete')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify(body),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('[PayPayComplete] API error response:', {
        status: response.status,
        errorData: responseData,
      })
      return createNoCacheResponse(
        { error: { code: responseData.code || 'API_ERROR', message: responseData.message || 'PayPay購入完了処理に失敗しました' } },
        { status: response.status },
      )
    }

    return createNoCacheResponse(responseData)
  } catch (error) {
    console.error('[PayPayComplete] API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'PayPay購入完了処理中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
