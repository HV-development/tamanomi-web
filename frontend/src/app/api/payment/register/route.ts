import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, userEmail, planId, customerFamilyName, customerName, companyName } = body
    
    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/payment/register')
    
    console.log('Payment register API request:', {
      method: 'POST',
      url: fullUrl,
      body: {
        customerId,
        userEmail,
        planId,
        customerFamilyName,
        customerName,
        companyName
      }
    })
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        userEmail,
        planId,
        customerFamilyName,
        customerName,
        companyName
      }),
    })
    
    console.log('Payment register API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment register API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'カード登録の準備に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Payment register data received:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment register API fetch error:', error)
    return NextResponse.json(
      { error: 'カード登録の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

