import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
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

    const fullUrl = buildApiUrl('/password/change')

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    })

    return response
  } catch (error) {
    console.error('❌ [password/change] Route error:', error)
    return createNoCacheResponse(
      { error: { message: 'パスワード変更中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
