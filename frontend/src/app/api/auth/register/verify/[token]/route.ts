import { NextRequest, NextResponse } from 'next/server'
import { secureFetch } from '@/lib/fetch-utils'

// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        console.log('[register/verify] Starting token verification')
        const { token } = await params
        console.log('[register/verify] Token extracted:', token ? 'present' : 'missing')

        if (!token) {
            console.error('[register/verify] Token is missing')
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }

        // トークンはUUIDのみで、メールアドレスなどの個人情報は含まれない（セキュリティ改善）
        // バックエンドAPIでトークンを検証（POSTメソッドでトークンをボディ送信）
        try {
            const backendUrl = `${API_BASE_URL}/api/v1/register/token-info`
            console.log('[register/verify] Backend URL:', backendUrl)
            console.log('[register/verify] API_BASE_URL:', API_BASE_URL)
            console.log('[register/verify] DOCKER_ENV:', process.env.DOCKER_ENV)
            
            const response = await secureFetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })

            console.log('[register/verify] Response status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('[register/verify] Token verification failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                })
                
                // エラーコードに応じてリダイレクト
                if (errorData.error?.code === 'REGISTRATION_TOKEN_EXPIRED') {
                    return NextResponse.redirect(new URL('/email-registration?error=token_expired', request.url))
                }
                return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
            }

            const data = await response.json()
            console.log('[register/verify] Token verification successful:', { valid: data.valid })

            // 検証成功 - 新規登録画面にリダイレクト（emailパラメータは含めない - セキュリティ改善）
            const registerUrl = new URL('/register', request.url)
            registerUrl.searchParams.set('token', token)
            
            // URLパラメータから紹介者IDを取得して含める
            const ref = request.nextUrl.searchParams.get('ref')
            if (ref) {
              registerUrl.searchParams.set('ref', ref)
            }

            // shop_idがURLパラメータに含まれている場合は追加
            const shopIdFromQuery = request.nextUrl.searchParams.get('shop_id')
            if (shopIdFromQuery) {
              registerUrl.searchParams.set('shop_id', shopIdFromQuery)
            }

            console.log('[register/verify] Redirecting to:', registerUrl.toString())
            return NextResponse.redirect(registerUrl)
        } catch (error) {
            console.error('[register/verify] Error during token verification:', error)
            if (error instanceof Error) {
                console.error('[register/verify] Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                })
            }
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }
    } catch (error) {
        console.error('[register/verify] Error in GET handler:', error)
        if (error instanceof Error) {
            console.error('[register/verify] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            })
        }
        return NextResponse.redirect(new URL('/email-registration?error=verification_failed', request.url))
    }
}
