import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, userEmail, planId, customerFamilyName, customerName, companyName, isPaymentMethodChange } = body

    console.log('🔍 [Next.js API Route] Request body:', {
      customerId,
      userEmail,
      planId,
      isPaymentMethodChange,
      hasIsPaymentMethodChange: 'isPaymentMethodChange' in body,
      bodyKeys: Object.keys(body),
    })

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/payment/register')

    const backendRequestBody = {
      customerId,
      userEmail,
      planId,
      customerFamilyName,
      customerName,
      companyName,
      isPaymentMethodChange
    }

    console.log('🔍 [Next.js API Route] Backend request body:', backendRequestBody)

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequestBody),
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

    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment register API fetch error:', error)
    return NextResponse.json(
      { error: 'カード登録の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

