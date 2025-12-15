import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    const fullUrl = buildApiUrl('/login')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // ログインエンドポイントは認証不要
      },
      body: JSON.stringify({
        email,
        password
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // エラーメッセージを取得（formatErrorResponseの構造に対応）
      let errorMessage = errorData.error?.message || errorData.message || 'ログインに失敗しました'

      // 退会済みアカウントの場合、より分かりやすいメッセージに変更
      if (errorMessage.includes('退会済み') || errorMessage.includes('suspended')) {
        errorMessage = 'このアカウントは退会済みです。同じメールアドレスで新規登録を行ってください。'
      }

      // バリデーションエラーの場合
      if (response.status === 400) {
        return createNoCacheResponse(
          { error: errorMessage },
          { status: response.status }
        )
      }

      // 認証エラー（401）の場合
      if (response.status === 401) {
        return createNoCacheResponse(
          { error: errorMessage },
          { status: response.status }
        )
      }

      // その他のエラー
      return createNoCacheResponse(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    // トークンをクッキーに保存するなどの処理が必要な場合はここで実行
    // 現時点では単純にレスポンスを返す

    return createNoCacheResponse(data)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ [auth/login] Route error:', errorMessage, error)
    return createNoCacheResponse(
      { error: 'ログイン処理中にエラーが発生しました', details: errorMessage },
      { status: 500 }
    )
  }
}
