import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params
    const searchParams = request.nextUrl.searchParams
    const recursive = searchParams.get('recursive') === 'true'

    const fullUrl = buildApiUrl(`/payment/qr/transactions/${transactionId}${recursive ? '?recursive=true' : ''}`)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('QR transaction get API error response:', {
        status: response.status,
        errorData: responseData,
      })
      return NextResponse.json(
        { error: { code: responseData.code || 'API_ERROR', message: responseData.message || '取引情報の取得に失敗しました' } },
        { status: response.status },
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('QR transaction get API error:', error)
    return NextResponse.json(
      { error: { code: 'NETWORK_ERROR', message: '取引情報の取得中にエラーが発生しました' } },
      { status: 500 },
    )
  }
}

