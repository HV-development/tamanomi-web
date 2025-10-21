import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, customerCardId, userEmail, planId } = body
    
    const fullUrl = buildApiUrl('/payment/update')
    
    console.log('Payment update API request:', {
      method: 'POST',
      url: fullUrl,
      body: {
        customerId,
        customerCardId,
        userEmail,
        planId,
      }
    })
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        customerCardId,
        userEmail,
        planId,
      }),
    })
    
    console.log('Payment update API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment update API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'カード変更の準備に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Payment update data received:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment update API fetch error:', error)
    return NextResponse.json(
      { error: 'カード変更の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


