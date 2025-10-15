import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, requestId } = body
    
    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/otp/verify')
    
    console.log('Verify OTP API request:', {
      method: 'POST',
      url: fullUrl,
      email,
      requestId
    })
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, requestId }),
    })
    
    console.log('Verify OTP API response:', {
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Verify OTP API error:', errorData)
      
      // バリデーションエラーの詳細を表示
      if (errorData.error?.details) {
        console.error('Validation details:', JSON.stringify(errorData.error.details, null, 2))
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || errorData.message || 'OTP検証に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('OTP verified successfully')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Verify OTP API fetch error:', error)
    return NextResponse.json(
      { error: 'OTP検証処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

