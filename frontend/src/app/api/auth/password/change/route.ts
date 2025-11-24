import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: { message: '現在のパスワードと新しいパスワードは必須です' } },
        { status: 400 }
      )
    }

    const authHeader = getAuthHeader(request)
    if (!authHeader) {
      return NextResponse.json(
        { error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/password/change')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
      cache: 'no-store',
    })


    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [password/change] Backend API error:', data)
      return NextResponse.json(
        { error: data.error || { message: 'パスワード変更に失敗しました' } },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [password/change] Route error:', error)
    return NextResponse.json(
      { error: { message: 'パスワード変更中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
