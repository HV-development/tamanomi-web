import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/paypay/pay')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify(body),
    })

    return response
  } catch (error) {
    console.error('PayPay payment API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'PayPay決済の申込中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
