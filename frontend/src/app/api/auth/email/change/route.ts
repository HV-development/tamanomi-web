import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

    // バリデーション
    if (!body.currentPassword || !body.newEmail || !body.confirmEmail) {
      return NextResponse.json(
        { error: { message: '現在のパスワード、新しいメールアドレス、確認メールアドレスは必須です' } },
        { status: 400 }
      )
    }

    // メールアドレスの一致確認
    if (body.newEmail !== body.confirmEmail) {
      return NextResponse.json(
        { error: { message: '新しいメールアドレスと確認メールアドレスが一致しません' } },
        { status: 400 }
      )
    }

    // 認証トークンを取得
    const authHeader = getAuthHeader(request)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: '認証トークンが必要です' } },
        { status: 401 }
      )
    }
    const token = authHeader.substring(7)

    // バックエンドAPIに転送
    const fullUrl = `${baseUrl}/api/v1/email/change`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newEmail: body.newEmail,
          confirmEmail: body.confirmEmail,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseData = await response.json()

      if (!response.ok) {
        return NextResponse.json(
          { error: responseData.error || { message: 'メールアドレス変更に失敗しました' } },
          { status: response.status }
        )
      }

      return NextResponse.json(responseData)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: { message: 'リクエストがタイムアウトしました' } },
          { status: 408 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Email change error:', error)
    return NextResponse.json(
      { error: { message: 'メールアドレス変更に失敗しました' } },
      { status: 500 }
    )
  }
}

