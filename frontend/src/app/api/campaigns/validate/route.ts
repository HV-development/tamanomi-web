import { NextRequest } from 'next/server'
import { campaignValidateRequestSchema } from '@hv-development/schemas'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return createNoCacheResponse(
      {
        valid: false,
        reason: 'MALFORMED_REQUEST',
        message: 'リクエスト形式が不正です',
      },
      { status: 400 }
    )
  }

  const parseResult = campaignValidateRequestSchema.safeParse(body)
  if (!parseResult.success) {
    return createNoCacheResponse(
      {
        valid: false,
        reason: 'MISSING_CODE',
        message: 'コードを入力してください',
      },
      { status: 400 }
    )
  }

  try {
    const { code } = parseResult.data

    const fullUrl = buildApiUrl('/campaigns/validate')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify({ code }),
    })

    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('❌ [campaigns/validate] Backend API error:', data)
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'キャンペーンコードの検証に失敗しました' },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error) {
    console.error('Campaign validate API fetch error:', error)
    return createNoCacheResponse(
      { error: 'キャンペーンコードの検証中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
