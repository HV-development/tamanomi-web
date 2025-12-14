import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetch } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

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

    let body: any
    try {
      body = JSON.parse(rawBody)
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

    const validatedData: any = {
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

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/3e7657cf-d90c-47dc-87dc-00ee22e9e998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:93',message:'Request body before sending',data:{validatedData,bodyKeys:Object.keys(validatedData),phoneValue:validatedData.phone,postalCodeValue:validatedData.postalCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      const response = await secureFetch(fullUrl, {
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
        let responseText: string = ''
        try {
          // まずテキストとして取得（JSONパースに失敗する可能性があるため）
          responseText = await response.text()

          // #region agent log
          console.error('[DEBUG] Error response text:', responseText);
          console.error('[DEBUG] Response status:', response.status);
          console.error('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
          // #endregion

          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            try {
              errorData = JSON.parse(responseText)
              // #region agent log
              console.error('[DEBUG] Parsed error data:', errorData);
              // #endregion
            } catch (jsonParseError) {
              errorData = { message: responseText.substring(0, 200) }
              // #region agent log
              console.error('[DEBUG] JSON parse error:', jsonParseError);
              // #endregion
            }
          } else {
            errorData = { message: responseText.substring(0, 200) }
          }
        } catch (parseError) {
          errorData = { message: 'レスポンスの解析に失敗しました' }
          // #region agent log
          console.error('[DEBUG] Parse error:', parseError);
          // #endregion
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
          // #region agent log
          console.error('[DEBUG] Validation error details:', { errorCode, errorMessage, errorDetails, errorData, validatedData });
          fetch('http://127.0.0.1:7243/ingest/3e7657cf-d90c-47dc-87dc-00ee22e9e998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:167',message:'Validation error details from API',data:{errorCode,errorMessage,errorDetails,errorData,validatedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
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

        // #region agent log
        console.error('[DEBUG] Final error response:', {
          status: response.status,
          errorCode: finalErrorCode,
          errorMessage: finalErrorMessage,
          errorDetails: finalErrorDetails,
          fullErrorData: errorData,
          validatedData
        });
        fetch('http://127.0.0.1:7243/ingest/3e7657cf-d90c-47dc-87dc-00ee22e9e998',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:190',message:'Final error response',data:{status:response.status,errorCode:finalErrorCode,errorMessage:finalErrorMessage,errorDetails:finalErrorDetails,fullErrorData:errorData,validatedData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

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

      // トークンをCookieに保存（ログイン時と同様に）
      const nextResponse = createNoCacheResponse(data, { status: response.status })
      const isSecure = (() => {
        try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
      })()

      if (data.accessToken) {
        // 通常のCookie（開発環境・本番環境の両方で動作）
        nextResponse.cookies.set('accessToken', data.accessToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 15, // 15分
        })
        // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
        // 開発環境（HTTP）ではsecure: falseのため設定されないが、エラーにはならない
        if (isSecure) {
          nextResponse.cookies.set('__Host-accessToken', data.accessToken, {
            httpOnly: true,
            secure: true, // __Host-プレフィックスにはsecure: trueが必須
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 15,
          })
        }
      }
      if (data.refreshToken) {
        // 通常のCookie（開発環境・本番環境の両方で動作）
        nextResponse.cookies.set('refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30日
        })
        // __Host-プレフィックス付きCookie（HTTPS環境でのみ有効）
        if (isSecure) {
          nextResponse.cookies.set('__Host-refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: true, // __Host-プレフィックスにはsecure: trueが必須
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          })
        }
      }
      
      console.log('🔐 [register] Set access token cookies', {
        isSecure,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      })

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
