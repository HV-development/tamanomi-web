import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.currentPassword || !body.newPassword) {
      return createNoCacheResponse(
        { error: { message: '現在のパスワードと新しいパスワードは必須です' } },
        { status: 400 }
      )
    }

    const authHeader = getAuthHeader(request)
    if (!authHeader) {
      return createNoCacheResponse(
        { error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/password/change')

    const response = await secureFetchWithAuth(fullUrl, authHeader, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [password/change] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.error || { message: 'パスワード変更に失敗しました' } },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [password/change] Route error:', error)
    return createNoCacheResponse(
      { error: { message: 'パスワード変更中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
