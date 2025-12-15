import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/qr/pay')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 決済は認証が必要
      },
      body: JSON.stringify(body),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('QR payment API error response:', {
        status: response.status,
        errorData: responseData,
      })
      return createNoCacheResponse(
        { error: { code: responseData.code || 'API_ERROR', message: responseData.message || 'イオンペイ決済の申込に失敗しました' } },
        { status: response.status },
      )
    }

    return createNoCacheResponse(responseData)
  } catch (error) {
    console.error('QR payment API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: 'イオンペイ決済の申込中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
