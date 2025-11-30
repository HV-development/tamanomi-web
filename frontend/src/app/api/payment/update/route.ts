import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      customerCardId,
      userEmail,
      planId,
      runningId,
      tradingId,
      amount, // プラン変更時の金額
      endScheduled, // 退会時の課金終了日（YYYYMMDD形式）
      description
    } = body

    const fullUrl = buildApiUrl('/payment/update')

    // amountもendScheduledも指定されていない場合はエラー
    if (amount === undefined && endScheduled === undefined) {
      return NextResponse.json(
        { error: 'amount（プラン変更時）またはendScheduled（退会時）のいずれかを指定してください。' },
        { status: 400 }
      )
    }

    // runningIdまたはtradingIdのいずれかが必要
    if (!runningId && !tradingId) {
      return NextResponse.json(
        { error: 'runningIdまたはtradingIdのいずれかが必要です。' },
        { status: 400 }
      )
    }

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
        runningId,
        tradingId,
        amount, // プラン変更時のみ設定
        endScheduled, // 退会時のみ設定
        description,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Payment update API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || errorData.error || '継続課金変更に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment update API fetch error:', error)
    return NextResponse.json(
      { error: '継続課金変更中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


