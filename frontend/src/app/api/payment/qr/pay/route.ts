import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullUrl = buildApiUrl('/payment/qr/pay')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('QR payment API error response:', {
        status: response.status,
        errorData: responseData,
      })
      return NextResponse.json(
        { error: { code: responseData.code || 'API_ERROR', message: responseData.message || 'イオンペイ決済の申込に失敗しました' } },
        { status: response.status },
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('QR payment API error:', error)
    return NextResponse.json(
      { error: { code: 'NETWORK_ERROR', message: 'イオンペイ決済の申込中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}


