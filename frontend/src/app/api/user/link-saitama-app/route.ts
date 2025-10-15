import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { saitamaAppId } = body

    if (!saitamaAppId || saitamaAppId.trim() === '') {
      return NextResponse.json(
        { error: 'さいたま市アプリIDを入力してください' },
        { status: 400 }
      )
    }

    const backendBaseUrl = process.env.API_BASE_URL || 'http://api:3002/api/v1'
    const fullUrl = `${backendBaseUrl}/users/me/link-saitama-app`

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ saitamaAppId }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend API error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'さいたま市アプリ連携に失敗しました' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Link saitama app route error:', error)
    return NextResponse.json(
      { error: 'さいたま市アプリ連携中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

