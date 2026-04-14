import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { setTokenCookies, isSecureRequest } from '@/lib/token-cookie'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Next.jsのAPIルートはプリフェッチなどで空ボディのまま叩かれることがあるため、
    // まずテキストとして受け取り、空チェックとJSONパースを明示的に行う
    const rawBody = await request.text()

    if (!rawBody || rawBody.trim().length === 0) {
      return createNoCacheResponse(
        {
          success: false,
          message: 'リクエストボディが空です。フォームから再度送信してください。'
        },
        { status: 400 }
      )
    }

    interface RequestBody {
      password?: string;
      passwordConfirm?: string;
      nickname?: string;
      postalCode?: string;
      address?: string;
      birthDate?: string;
      gender?: string;
      phone?: string;
      saitamaAppId?: string;
      referrerUserId?: string;
      shopId?: string;
      token?: string;
    }
    let body: RequestBody
    try {
      body = JSON.parse(rawBody) as RequestBody
    } catch (parseError) {
      console.error('Register API: JSON parse error', parseError)
      return createNoCacheResponse(
        {
          success: false,
          message: 'リクエスト形式が正しくありません。',
          error: parseError instanceof Error ? parseError.message : 'JSON parse error'
        },
        { status: 400 }
      )
    }

    // バックエンドが期待するデータ構造に変換
    // セキュリティ改善：メールアドレスはリクエストボディに含めず、トークンから取得される
    // 空文字列のsaitamaAppIdとreferrerUserIdは除外
    // 生年月日をISO形式（YYYY-MM-DD）に変換（スラッシュ区切りから変換）
    const formatBirthDate = (dateStr: string | undefined): string | undefined => {
      if (!dateStr) return undefined
      // yyyy/MM/dd形式をyyyy-MM-dd形式に変換
      return dateStr.replace(/\//g, '-')
    }

    // 郵便番号からハイフンとスペースを削除（7桁の数字のみを許可）
    const formatPostalCode = (postalCode: string | undefined): string | undefined => {
      if (!postalCode) return undefined
      // ハイフンやスペースを削除して数字のみにする
      return postalCode.replace(/[-\s]/g, '')
    }

    interface ValidatedData {
      password?: string;
      passwordConfirm?: string;
      nickname?: string;
      postalCode?: string;
      address?: string;
      birthDate?: string;
      gender?: string;
      phone?: string;
      saitamaAppId?: string;
      referrerUserId?: string;
      shopId?: string;
      token?: string;
    }
    const validatedData: ValidatedData = {
      // emailはスキーマでオプショナルになったため、送信しない（トークンから取得される）
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      nickname: body.nickname,
      postalCode: formatPostalCode(body.postalCode),
      address: body.address,
      birthDate: formatBirthDate(body.birthDate),
      gender: body.gender,
      phone: body.phone ? body.phone.trim() : '',
      token: body.token
    };

    // オプショナルフィールドを追加（存在する場合のみ）
    if (body.saitamaAppId && body.saitamaAppId.trim() !== '') {
      validatedData.saitamaAppId = body.saitamaAppId.trim()
    }
    if (body.referrerUserId && body.referrerUserId.trim() !== '') {
      validatedData.referrerUserId = body.referrerUserId.trim()
    }
    if (body.shopId) {
      validatedData.shopId = body.shopId
    }

    // タイムアウト設定付きのfetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/register/complete');

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: false, // 登録エンドポイントは認証不要
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // レスポンスのステータスをチェック
      if (!response.ok) {
        interface ErrorData {
          error?: {
            code?: string;
            message?: string;
            details?: unknown;
            errors?: unknown;
          };
          errorCode?: string;
          message?: string;
          errors?: unknown;
        }
        let errorData: ErrorData = {}
        let responseText: string = ''
        try {
          // まずテキストとして取得（JSONパースに失敗する可能性があるため）
          responseText = await response.text()

          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            try {
              errorData = JSON.parse(responseText)
            } catch {
              errorData = { message: responseText.substring(0, 200) }
            }
          } else {
            errorData = { message: responseText.substring(0, 200) }
          }
        } catch {
          errorData = { message: 'レスポンスの解析に失敗しました' }
        }

        // エラーコードを取得
        const errorCode = errorData?.error?.code || errorData?.errorCode
        const errorMessage = errorData?.error?.message || errorData?.message
        const errorDetails = errorData?.error?.details || errorData?.error?.errors || errorData?.errors

        // 409エラー（既存アカウント・重複ID）の場合は特別な処理
        if (response.status === 409) {
          if (errorCode === 'SAITAMA_APP_ID_ALREADY_EXISTS') {
            return createNoCacheResponse(
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
          return createNoCacheResponse(
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
          return createNoCacheResponse(
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

        // バリデーションエラーの場合は特別な処理
        if (errorCode === 'VALIDATION_ERROR' && errorDetails) {
          // バリデーションエラーの詳細を返す
          return createNoCacheResponse(
            {
              success: false,
              message: errorMessage || '入力データが無効です',
              errorCode: 'VALIDATION_ERROR',
              error: {
                code: 'VALIDATION_ERROR',
                message: errorMessage || '入力データが無効です',
                details: errorDetails
              }
            },
            { status: 400 }
          )
        }

        // その他のエラー
        // エラーレスポンスの構造を確認して、適切にエラー情報を返す
        const finalErrorCode = errorCode || errorData?.error?.code || 'API_ERROR'
        const finalErrorMessage = errorMessage || errorData?.error?.message || `サーバーエラーが発生しました (${response.status})`
        const finalErrorDetails = errorData?.error?.details || errorData?.error?.errors || errorData?.error

        console.error('[api/auth/register] Final error response:', {
          status: response.status,
          errorCode: finalErrorCode,
          errorMessage: finalErrorMessage,
          errorDetails: finalErrorDetails,
          fullErrorData: errorData
        })

        return createNoCacheResponse(
          {
            success: false,
            message: finalErrorMessage,
            errorCode: finalErrorCode,
            error: {
              code: finalErrorCode,
              message: finalErrorMessage,
              ...(finalErrorDetails && Object.keys(finalErrorDetails).length > 0 && { details: finalErrorDetails })
            }
          },
          { status: response.status }
        )
      }

      const data = await response.json()

      const nextResponse = createNoCacheResponse(data, { status: response.status })
      const isSecure = isSecureRequest(request)
      setTokenCookies(nextResponse, data, isSecure)

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
        return createNoCacheResponse(
          { success: false, message: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。' },
          { status: 408 }
        )
      }

      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return createNoCacheResponse(
          { success: false, message: 'サーバーに接続できません。ネットワーク接続を確認してください。' },
          { status: 503 }
        )
      }
    }

    return createNoCacheResponse(
      {
        success: false,
        message: 'リクエストの処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
