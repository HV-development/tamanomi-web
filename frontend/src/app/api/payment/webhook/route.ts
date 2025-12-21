import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse, addNoCacheHeaders } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const fullUrl = buildApiUrl('/payment/webhook')
    
    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // Webhookは認証不要
        customHeaders: {
          'Host': request.headers.get('host') || 'localhost:3000',
        },
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Payment webhook API error:', errorText)
      return createNoCacheResponse(
        { error: 'Webhook処理に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.text()
    
    const nextResponse = new NextResponse(data, { status: 200 })
    return addNoCacheHeaders(nextResponse)
  } catch (error) {
    console.error('Payment webhook API fetch error:', error)
    return createNoCacheResponse(
      { error: 'Webhook処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
