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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return createNoCacheResponse(
        { error: errorData.message || 'PayPay取引情報の取得に失敗しました' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return createNoCacheResponse(data)
  } catch (error) {
    console.error('PayPay transaction status API error:', error)
    return createNoCacheResponse(
      { error: 'PayPay取引情報の取得中にエラーが発生しました' },
      { status: 500 },
    )
  }
}
