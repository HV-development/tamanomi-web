import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { setTokenCookies, isSecureRequest } from '@/lib/token-cookie'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    const fullUrl = buildApiUrl('/login')

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: false,
      },
      body: JSON.stringify({
        email,
        password
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      let errorMessage = errorData.error?.message || errorData.message || 'ログインに失敗しました'

      if (errorMessage.includes('退会済み') || errorMessage.includes('suspended')) {
        errorMessage = 'このアカウントは退会済みです。同じメールアドレスで新規登録を行ってください。'
      }

      return createNoCacheResponse(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    const res = createNoCacheResponse({ message: 'Login successful' })
    const isSecure = isSecureRequest(request)
    setTokenCookies(res, data, isSecure)

    return res
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ [auth/login] Route error:', errorMessage, error)
    return createNoCacheResponse(
      { error: 'ログイン処理中にエラーが発生しました', details: errorMessage },
      { status: 500 }
    )
  }
}
