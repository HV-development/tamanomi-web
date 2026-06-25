import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/paypay/complete')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify(body),
    })

    return response
  } catch (error) {
    console.error('[PayPayComplete] API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'PayPay購入完了処理中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
