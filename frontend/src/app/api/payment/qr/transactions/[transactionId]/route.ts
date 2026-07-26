import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params
    const searchParams = request.nextUrl.searchParams
    const recursive = searchParams.get('recursive') === 'true'

    const fullUrl = buildApiUrl(`/payment/qr/transactions/${transactionId}${recursive ? '?recursive=true' : ''}`)

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true,
      },
    })

    return response
  } catch (error) {
    console.error('QR transaction get API error:', error)
    return createNoCacheResponse(
      { error: { code: 'NETWORK_ERROR', message: '取引情報の取得中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}
