import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/users/me/withdraw')

    const response = await secureFetchWithAuth(fullUrl, authHeader, {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [user/withdraw] Backend API error:', data)
      return createNoCacheResponse(
        data,
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('❌ [user/withdraw] Route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '退会処理に失敗しました', details: errorMessage } },
      { status: 500 }
    )
  }
}
