import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{
    transactionId: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { transactionId } = await params

    const fullUrl = buildApiUrl(`/payment/paypay/transactions/${encodeURIComponent(transactionId)}`)

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true, // 取引情報の取得は認証が必要
      },
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('PayPay transaction status API error response:', {
        status: response.status,
        transactionId,
        errorData: responseData,
      })
      return createNoCacheResponse(
        { error: { code: responseData.code || 'API_ERROR', message: responseData.message || 'PayPay取引情報の取得に失敗しました' } },
        { status: response.status },
      )
    }

    return createNoCacheResponse(responseData)
  } catch (error) {
    console.error('PayPay transaction status API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'PayPay取引情報の取得中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
