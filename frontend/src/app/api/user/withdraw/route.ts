import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const fullUrl = buildApiUrl('/users/me/withdraw')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true,
      },
      body: JSON.stringify({}),
    })

    return response
  } catch (error) {
    console.error('❌ [user/withdraw] Route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '退会処理に失敗しました', details: errorMessage } },
      { status: 500 }
    )
  }
}
