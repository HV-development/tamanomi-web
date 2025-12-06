import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{
    transactionId: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { transactionId } = await params

    const fullUrl = buildApiUrl(`/payment/paypay/transactions/${encodeURIComponent(transactionId)}`)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'PayPay取引情報の取得に失敗しました' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('PayPay transaction status API error:', error)
    return NextResponse.json(
      { error: 'PayPay取引情報の取得中にエラーが発生しました' },
      { status: 500 },
    )
  }
}



