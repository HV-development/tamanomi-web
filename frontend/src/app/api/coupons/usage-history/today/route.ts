import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const shopId = url.searchParams.get('shopId')
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopIdパラメータが必要です' },
        { status: 400 }
      )
    }


    const fullUrl = buildApiUrl(`/coupons/usage-history/today?shopId=${encodeURIComponent(shopId)}`)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    })


    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [usage-history/today] Backend API error:', data)
      return NextResponse.json(
        { error: data.message || data.error?.message || '使用履歴の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [usage-history/today] Route error:', error)
    return NextResponse.json(
      { error: '使用履歴の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


