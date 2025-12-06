import { NextRequest, NextResponse } from 'next/server'
import { UserRegistrationRequestSchema } from '@/schemas/auth'
import { z } from 'zod'

const TAMAYOI_API_URL = process.env.TAMAYOI_API_URL || 'http://localhost:3001'

// メールアドレスのみのバリデーションスキーマ
const EmailValidationSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = EmailValidationSchema.parse(body)

    const response = await fetch(`${TAMAYOI_API_URL}/api/auth/pre-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { success: false, message: 'リクエストの処理に失敗しました' },
      { status: 500 }
    )
  }
}
