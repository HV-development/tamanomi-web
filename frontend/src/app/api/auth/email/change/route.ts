import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.currentPassword || !body.newEmail || !body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '現在のパスワード、新しいメールアドレス、確認メールアドレスは必須です' } },
        { status: 400 }
      )
    }

    if (body.newEmail !== body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '新しいメールアドレスと確認メールアドレスが一致しません' } },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl('/email/change')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const { response } = await authenticatedFetch(request, fullUrl, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newEmail: body.newEmail,
          confirmEmail: body.confirmEmail,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return createNoCacheResponse(
          { error: { message: 'リクエストがタイムアウトしました' } },
          { status: 408 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('Email change error:', error)
    return createNoCacheResponse(
      { error: { message: 'メールアドレス変更に失敗しました' } },
      { status: 500 }
    )
  }
}
