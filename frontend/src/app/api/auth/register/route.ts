import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    // Next.jsのAPIルートはプリフェッチなどで空ボディのまま叩かれることがあるため、
    // まずテキストとして受け取り、空チェックとJSONパースを明示的に行う
    const rawBody = await request.text()

    if (!rawBody || rawBody.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'リクエストボディが空です。フォームから再度送信してください。'
        },
        { status: 400 }
      )
    }

    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Register API: JSON parse error', parseError)
      return NextResponse.json(
        {
          success: false,
          message: 'リクエスト形式が正しくありません。',
          error: parseError instanceof Error ? parseError.message : 'JSON parse error'
        },
        { status: 400 }
      )
    }

    // バックエンドが期待するデータ構造に変換
    // 空文字列のsaitamaAppIdとreferrerUserIdは除外
    const validatedData = {
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      nickname: body.nickname,
      postalCode: body.postalCode,
      address: body.address,
      birthDate: body.birthDate,
      gender: body.gender,
      phone: body.phone,
      ...(body.saitamaAppId && body.saitamaAppId.trim() !== '' ? { saitamaAppId: body.saitamaAppId.trim() } : {}),
      ...(body.referrerUserId && body.referrerUserId.trim() !== '' ? { referrerUserId: body.referrerUserId.trim() } : {}),
      token: body.token
    };

    // タイムアウト設定付きのfetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/register/complete');

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // レスポンスのステータスをチェック
      if (!response.ok) {
        let errorData: any = {}
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            const text = await response.text()
            console.error('[api/auth/register] backend returned non-JSON response:', text.substring(0, 200))
            errorData = { message: text.substring(0, 200) }
          }
        } catch (parseError) {
          console.error('[api/auth/register] failed to parse error response:', parseError)
          errorData = { message: 'レスポンスの解析に失敗しました' }
        }

        console.error('[api/auth/register] backend error:', {
          status: response.status,
          errorData,
        })

        // エラーコードを取得
        const errorCode = errorData?.error?.code || errorData?.errorCode
        const errorMessage = errorData?.error?.message || errorData?.message

        // 409エラー（既存アカウント・重複ID）の場合は特別な処理
        if (response.status === 409) {
          if (errorCode === 'SAITAMA_APP_ID_ALREADY_EXISTS') {
            return NextResponse.json(
              {
                success: false,
                message: errorMessage || 'このさいたま市アプリIDは既に登録されています',
                errorCode: 'SAITAMA_APP_ID_ALREADY_EXISTS',
                error: {
                  code: 'SAITAMA_APP_ID_ALREADY_EXISTS',
                  message: errorMessage || 'このさいたま市アプリIDは既に登録されています'
                }
              },
              { status: 409 }
            )
          }
          // USER_ALREADY_EXISTSの場合
          return NextResponse.json(
            {
              success: false,
              message: errorMessage || 'このメールアドレスは既に登録されています。ログイン画面からログインしてください。',
              errorCode: 'USER_ALREADY_EXISTS',
              error: {
                code: 'USER_ALREADY_EXISTS',
                message: errorMessage || 'このメールアドレスは既に登録されています。ログイン画面からログインしてください。'
              }
            },
            { status: 409 }
          )
        }

        // 500エラー（ポイント付与失敗）の場合
        if (response.status === 500 && errorCode === 'POINT_GRANT_FAILED') {
          return NextResponse.json(
            {
              success: false,
              message: errorMessage || 'ポイント付与に失敗しました。しばらく経ってから再度お試しください。',
              errorCode: 'POINT_GRANT_FAILED',
              error: {
                code: 'POINT_GRANT_FAILED',
                message: errorMessage || 'ポイント付与に失敗しました。しばらく経ってから再度お試しください。'
              }
            },
            { status: 500 }
          )
        }

        // その他のエラー
        return NextResponse.json(
          {
            success: false,
            message: errorMessage || `サーバーエラーが発生しました (${response.status})`,
            errorCode: errorCode,
            error: errorData?.error || {
              code: errorCode || 'API_ERROR',
              message: errorMessage || `サーバーエラーが発生しました (${response.status})`
            }
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      
      // トークンをCookieに保存（ログイン時と同様に）
      const nextResponse = NextResponse.json(data, { status: response.status })
      const isSecure = (() => {
        try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
      })()
      
      nextResponse.headers.set('Cache-Control', 'no-store')
      nextResponse.headers.set('Pragma', 'no-cache')
      
      if (data.accessToken) {
        nextResponse.cookies.set('accessToken', data.accessToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 15, // 15分
        })
        nextResponse.cookies.set('__Host-accessToken', data.accessToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 15,
        })
      }
      if (data.refreshToken) {
        nextResponse.cookies.set('refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30日
        })
        nextResponse.cookies.set('__Host-refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        })
      }
      
      return nextResponse
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError;
    }
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // エラーの種類に応じて適切なメッセージを返す
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, message: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。' },
          { status: 408 }
        )
      }

      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          { success: false, message: 'サーバーに接続できません。ネットワーク接続を確認してください。' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'リクエストの処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
