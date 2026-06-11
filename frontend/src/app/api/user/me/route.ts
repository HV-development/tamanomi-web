import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/users/me')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'GET',
    })

    return response
  } catch (error) {
    console.error('❌ [user/me] Route error:', error)
    return createNoCacheResponse(
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
