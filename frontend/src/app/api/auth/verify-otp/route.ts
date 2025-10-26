import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, requestId } = body

    const fullUrl = buildApiUrl('/otp/verify')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, requestId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      console.log('🔍 [verify-otp] Error data:', errorData)
      console.log('🔍 [verify-otp] Response status:', response.status)

      return NextResponse.json(
        { error: errorData.error?.message || errorData.message || 'OTP検証に失敗しました' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'OTP検証処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

