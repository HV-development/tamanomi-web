import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

/**
 * トークンからメールアドレスを取得するAPIプロキシ
 * URLパラメータにメールアドレスを含めないためのセキュリティ改善
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { error: { code: 'MISSING_TOKEN', message: 'トークンが必要です' } },
                { status: 400 }
            )
        }

        // バックエンドAPIにプロキシ
        const response = await fetch(`${API_BASE_URL}/api/v1/register/token-info?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(errorData, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Token info API error:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
            { status: 500 }
        )
    }
}

