import { NextRequest } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

/**
 * トークンからメールアドレスを取得するAPIプロキシ
 * URLパラメータにメールアドレスを含めないためのセキュリティ改善
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token')

        if (!token) {
            return createNoCacheResponse(
                { error: { code: 'MISSING_TOKEN', message: 'トークンが必要です' } },
                { status: 400 }
            )
        }

        // バックエンドAPIにプロキシ
        const response = await secureFetchWithCommonHeaders(
            request,
            `${API_BASE_URL}/api/v1/register/token-info?token=${encodeURIComponent(token)}`,
            {
                method: 'GET',
                headerOptions: {
                    requireAuth: false,
                },
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return createNoCacheResponse(errorData, { status: response.status })
        }

        const data = await response.json()
        return createNoCacheResponse(data)
    } catch (error) {
        console.error('Token info API error:', error)
        return createNoCacheResponse(
            { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
            { status: 500 }
        )
    }
}

