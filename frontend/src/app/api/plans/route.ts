import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = searchParams.get('limit') || '50'
    const saitamaAppLinked = searchParams.get('saitamaAppLinked')

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

    // デバッグ: 環境変数の確認
    console.log('Environment check:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      API_BASE_URL: API_BASE_URL,
      baseUrl: baseUrl,
      NODE_ENV: process.env.NODE_ENV,
      saitamaAppLinked: saitamaAppLinked
    })

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      status,
      limit,
    })
    
    if (saitamaAppLinked !== null) {
      queryParams.append('saitamaAppLinked', saitamaAppLinked)
    }

    const fullUrl = `${baseUrl}/api/v1/plans?${queryParams.toString()}`

    console.log('Plans API request:', {
      method: 'GET',
      url: fullUrl,
      status,
      limit,
      saitamaAppLinked
    })

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Plans API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
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
    console.log('Plans data received:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Plans API fetch error:', error)
    return NextResponse.json(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
