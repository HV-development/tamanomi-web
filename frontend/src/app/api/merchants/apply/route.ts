import { NextRequest, NextResponse } from 'next/server'

// サーバーサイド用ベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/v1/merchants/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status >= 500) {
        return NextResponse.json(
          { error: { code: 'INTERNAL_SERVER_ERROR', message: 'お申し込みの処理に失敗しました。時間を置いて再度お試しください。' } },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: data?.error || { code: 'API_ERROR', message: data?.message || 'お申し込みに失敗しました' } },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { code: 'NETWORK_ERROR', message: 'ネットワークエラーが発生しました', detail: message } },
      { status: 500 }
    )
  }
}





