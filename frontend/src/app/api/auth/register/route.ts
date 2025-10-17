import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔍 [register/route] Received body:', {
      email: body.email,
      nickname: body.nickname,
      saitamaAppId: body.saitamaAppId,
      saitamaAppIdType: typeof body.saitamaAppId,
      saitamaAppIdLength: body.saitamaAppId?.length,
      saitamaAppIdValue: `"${body.saitamaAppId}"`,
    })

    // バックエンドが期待するデータ構造に変換
    // 空文字列のsaitamaAppIdは除外
    const validatedData = {
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      nickname: body.nickname,
      postalCode: body.postalCode,
      address: body.address,
      birthDate: body.birthDate,
      gender: body.gender,
      ...(body.saitamaAppId && body.saitamaAppId.trim() !== '' ? { saitamaAppId: body.saitamaAppId.trim() } : {}),
      token: body.token
    };

    console.log('🔍 [register/route] Validated data:', {
      email: validatedData.email,
      nickname: validatedData.nickname,
      hasSaitamaAppId: 'saitamaAppId' in validatedData,
      saitamaAppId: (validatedData as any).saitamaAppId,
    })

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
        const errorData = await response.json().catch(() => ({}))

        // 409エラー（既存アカウント）の場合は特別な処理
        if (response.status === 409) {
          return NextResponse.json(
            {
              success: false,
              message: 'このメールアドレスは既に登録されています。ログイン画面からログインしてください。',
              errorCode: 'USER_ALREADY_EXISTS',
              error: errorData
            },
            { status: 409 }
          )
        }

        return NextResponse.json(
          {
            success: false,
            message: errorData.message || `サーバーエラーが発生しました (${response.status})`,
            error: errorData
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
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
