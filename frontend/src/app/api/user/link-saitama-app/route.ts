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
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { saitamaAppId } = body

    if (!saitamaAppId || saitamaAppId.trim() === '') {
      return createNoCacheResponse(
        { error: 'さいたま市アプリIDを入力してください' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/users/me/link-saitama-app')

    const response = await secureFetchWithAuth(fullUrl, authHeader, {
      method: 'POST',
      body: JSON.stringify({ saitamaAppId }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend API error:', data)
      return createNoCacheResponse(
        { error: data.error?.message || 'さいたま市アプリ連携に失敗しました' },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)

  } catch (error) {
    console.error('Link saitama app route error:', error)
    return createNoCacheResponse(
      { error: 'さいたま市アプリ連携中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
