import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const fullUrl = buildApiUrl('/payment/webhook')
    
    console.log('Payment webhook API request:', {
      method: 'POST',
      url: fullUrl,
      body
    })
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': request.headers.get('host') || 'localhost:3000',
      },
      body: JSON.stringify(body),
    })
    
    console.log('Payment webhook API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Payment webhook API error:', errorText)
      return NextResponse.json(
        { error: 'Webhook処理に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.text()
    console.log('Payment webhook data received:', data)
    
    return new NextResponse(data, { status: 200 })
  } catch (error) {
    console.error('Payment webhook API fetch error:', error)
    return NextResponse.json(
      { error: 'Webhook処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


