import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: { message: 'トークンが必要です' } },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/email/change/confirm?token=${encodeURIComponent(token)}`)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || { message: 'メールアドレス変更の確認に失敗しました' } },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Email change confirmation error:', error)
    return NextResponse.json(
      { error: { message: 'メールアドレス変更の確認に失敗しました' } },
      { status: 500 }
    )
  }
}

