import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/users/me/withdraw')

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [user/withdraw] Backend API error:', data)
      return NextResponse.json(
        data,
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [user/withdraw] Route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '退会処理に失敗しました', details: errorMessage } },
      { status: 500 }
    )
  }
}

