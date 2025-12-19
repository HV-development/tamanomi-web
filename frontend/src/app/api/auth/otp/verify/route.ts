import { NextRequest } from 'next/server'
import { otpVerifySchema } from '@/schemas/auth'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

const TAMAYOI_API_URL = process.env.TAMAYOI_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = otpVerifySchema.parse(body)

        const response = await secureFetchWithCommonHeaders(request, `${TAMAYOI_API_URL}/api/auth/otp/verify`, {
            method: 'POST',
            headerOptions: {
                requireAuth: false, // OTP認証は認証不要
            },
            body: JSON.stringify(validatedData),
        })

        const data = await response.json()
        return createNoCacheResponse(data, { status: response.status })
    } catch {
        return createNoCacheResponse(
            { success: false, message: 'OTP認証の処理に失敗しました' },
            { status: 500 }
        )
    }
}
