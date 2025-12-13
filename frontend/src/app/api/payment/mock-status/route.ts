import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetch } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
    try {
        const fullUrl = buildApiUrl('/payment/mock-status')

        const response = await secureFetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Mock status API error:', errorData)
            return createNoCacheResponse(
                { error: errorData.message || errorData.error || 'モックモード状態の取得に失敗しました' },
                { status: response.status }
            )
        }

        const data = await response.json()

        return createNoCacheResponse(data)
    } catch (error) {
        console.error('Mock status API fetch error:', error)
        return createNoCacheResponse(
            { error: 'モックモード状態の取得中にエラーが発生しました' },
            { status: 500 }
        )
    }
}
