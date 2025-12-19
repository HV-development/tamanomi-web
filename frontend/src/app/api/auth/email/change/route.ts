import { NextRequest } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

    // バリデーション
    if (!body.currentPassword || !body.newEmail || !body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '現在のパスワード、新しいメールアドレス、確認メールアドレスは必須です' } },
        { status: 400 }
      )
    }

    // メールアドレスの一致確認
    if (body.newEmail !== body.confirmEmail) {
      return createNoCacheResponse(
        { error: { message: '新しいメールアドレスと確認メールアドレスが一致しません' } },
        { status: 400 }
      )
    }

    // バックエンドAPIに転送
    const fullUrl = `${baseUrl}/api/v1/email/change`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: true, // 認証が必要
        },
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newEmail: body.newEmail,
          confirmEmail: body.confirmEmail,
        }),
        signal: controller.signal,
      })

      // 認証エラーの場合は401を返す
      if (response.status === 401) {
        return createNoCacheResponse(
          { error: { message: '認証トークンが必要です' } },
          { status: 401 }
        )
      }

      clearTimeout(timeoutId)

      const responseData = await response.json()

      if (!response.ok) {
        return createNoCacheResponse(
          { error: responseData.error || { message: 'メールアドレス変更に失敗しました' } },
          { status: response.status }
        )
      }

      return createNoCacheResponse(responseData)
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
