import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/campaigns/me/current')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'GET',
    })

    return response
  } catch (error) {
    console.error('❌ [campaigns/me/current] Route error:', error)
    return createNoCacheResponse(
      { error: 'キャンペーン情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
