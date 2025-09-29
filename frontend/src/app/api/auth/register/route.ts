import { NextRequest, NextResponse } from 'next/server'
import { userRegistrationSchema } from '@/schemas/auth'

const TAMAYOI_API_URL = process.env.TAMAYOI_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 API received body:', body)
    
    const validatedData = userRegistrationSchema.parse(body)
    console.log('🔍 Validation successful:', validatedData)

    console.log('🔍 Calling external API:', `${TAMAYOI_API_URL}/api/auth/register`)
    const response = await fetch(`${TAMAYOI_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    })

    console.log('🔍 External API response status:', response.status)
    console.log('🔍 External API response ok:', response.ok)
    
    const data = await response.json()
    console.log('🔍 External API response data:', data)
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ API error details:', error)
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }
    return NextResponse.json(
      { success: false, message: 'リクエストの処理に失敗しました' },
      { status: 500 }
    )
  }
}
