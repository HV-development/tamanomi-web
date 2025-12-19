import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
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
    
    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true, // セッション情報の取得は認証が必要
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment session API error:', errorData)
      return createNoCacheResponse(
        { error: errorData.error || 'セッション情報の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Payment session API fetch error:', error)
    return createNoCacheResponse(
      { error: 'セッション情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
