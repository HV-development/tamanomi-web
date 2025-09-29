import { NextRequest, NextResponse } from 'next/server'
import { emailRegistrationSchema } from '@/schemas/auth'

const TAMAYOI_API_URL = process.env.TAMAYOI_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = emailRegistrationSchema.parse(body)

    const response = await fetch(`${TAMAYOI_API_URL}/api/auth/pre-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'リクエストの処理に失敗しました' },
      { status: 500 }
    )
  }
}
