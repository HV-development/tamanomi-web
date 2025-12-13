import { NextRequest, NextResponse } from 'next/server'
import { secureFetch } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

/**
 * トークンからメールアドレスを取得するAPIプロキシ
 * POSTメソッドを使用してトークンをボディで送信（プロキシログへの記録を防止）
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return createNoCacheResponse(
                { error: { code: 'MISSING_TOKEN', message: 'トークンが必要です' } },
                { status: 400 }
            )
        }

        // バックエンドAPIにPOSTでプロキシ（トークンをボディで送信）
        const response = await secureFetch(`${API_BASE_URL}/api/v1/register/token-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })

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
