import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id: customerId } = await params
    
    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl(`/payment/session/${customerId}`)
    
    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true,
      },
    })
    
    return response
  } catch (error) {
    console.error('Payment session API fetch error:', error)
    return createNoCacheResponse(
      { error: 'セッション情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
