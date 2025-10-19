import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/otp/send')
    
    console.log('Send OTP API request:', {
      method: 'POST',
      url: fullUrl,
      email
    })
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    console.log('Send OTP API response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Send OTP API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'OTP送信に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('OTP sent successfully')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Send OTP API fetch error:', error)
    return NextResponse.json(
      { error: 'OTP送信処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

