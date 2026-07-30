import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
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

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true,
      },
    })

    return response
  } catch (error) {
    console.error('PayPay transaction status API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'PayPay取引情報の取得中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
