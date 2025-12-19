import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/paypay/pay')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 決済は認証が必要
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return createNoCacheResponse(
        { error: errorData.message || 'PayPay決済の申込に失敗しました' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return createNoCacheResponse(data)
  } catch (error) {
    console.error('PayPay payment API error:', error)
    return createNoCacheResponse(
      { error: 'PayPay決済の申込中にエラーが発生しました' },
      { status: 500 },
    )
  }
}
