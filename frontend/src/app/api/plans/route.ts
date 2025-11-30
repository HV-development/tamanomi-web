import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = searchParams.get('limit') || '50'
    const saitamaAppLinked = searchParams.get('saitamaAppLinked')

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      status,
      limit,
    })
    
    if (saitamaAppLinked !== null) {
      queryParams.append('saitamaAppLinked', saitamaAppLinked)
    }

    const fullUrl = `${buildApiUrl('/plans')}?${queryParams.toString()}`


    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',  // キャッシュを無効化
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Plans API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'プランの取得に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Plans API fetch error:', error)
    return NextResponse.json(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
