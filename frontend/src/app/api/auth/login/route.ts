import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    const fullUrl = `${API_BASE_URL}/api/v1/login`
    
    console.log('Login API request:', {
      method: 'POST',
      url: fullUrl,
      email
    })
    
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
    
    console.log('Login API response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Login API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'ログインに失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Login successful')
    
    // トークンをクッキーに保存するなどの処理が必要な場合はここで実行
    // 現時点では単純にレスポンスを返す
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Login API fetch error:', error)
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

