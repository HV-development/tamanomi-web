import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    const fullUrl = `${baseUrl}/api/v1/login`

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // バリデーションエラーの場合
      if (response.status === 400 && errorData.message) {
        return NextResponse.json(
          { error: errorData.message },
          { status: response.status }
        )
      }

      // その他のエラー
      return NextResponse.json(
        { error: errorData.error?.message || errorData.message || 'ログインに失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // トークンをクッキーに保存するなどの処理が必要な場合はここで実行
    // 現時点では単純にレスポンスを返す

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

