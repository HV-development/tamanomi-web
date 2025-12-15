import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return createNoCacheResponse(
        { error: { message: 'トークンが必要です' } },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/email/change/confirm?token=${encodeURIComponent(token)}`)

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: false, // メールアドレス変更確認は認証不要
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return createNoCacheResponse(
        { error: data.error || { message: 'メールアドレス変更の確認に失敗しました' } },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Email change confirmation error:', error)
    return createNoCacheResponse(
      { error: { message: 'メールアドレス変更の確認に失敗しました' } },
      { status: 500 }
    )
  }
}
