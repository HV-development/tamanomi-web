import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(
  request: NextRequest,
  { params }: { params: { customer_id: string } }
) {
  try {
    const customerId = params.customer_id
    const fullUrl = `${API_BASE_URL}/api/v1/payment/session/${customerId}`
    
    console.log('Payment session API request:', {
      method: 'GET',
      url: fullUrl,
      customerId
    })
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Payment session API response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment session API error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'セッション情報の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Payment session API data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment session API fetch error:', error)
    return NextResponse.json(
      { error: 'セッション情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

