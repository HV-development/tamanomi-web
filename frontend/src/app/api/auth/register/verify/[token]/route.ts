import { NextRequest, NextResponse } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { addNoCacheHeaders } from '@/lib/response-utils'
import { API_BASE_URL } from '@/lib/api-config'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        if (!token) {
            console.error('🔍 [register/verify] No token provided')
            return addNoCacheHeaders(NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url)))
        }

        // トークンはUUIDのみで、メールアドレスなどの個人情報は含まれない（セキュリティ改善）
        // バックエンドAPIのconfirmRegistrationを呼び出して、トークンからapplicationIdを取得し、正しいフロントエンドURLを生成
        try {
            // shop_idがURLパラメータに含まれている場合は追加
            const shopIdFromQuery = request.nextUrl.searchParams.get('shop_id')
            const shopIdParam = shopIdFromQuery ? `?shop_id=${encodeURIComponent(shopIdFromQuery)}` : ''

            const verifyUrl = `${API_BASE_URL}/api/v1/register/verify/${token}${shopIdParam}`

            const response = await secureFetchWithCommonHeaders(
                request,
                verifyUrl,
                {
                    method: 'GET',
                    headerOptions: {
                        requireAuth: false,
                    },
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('🔍 [register/verify] Token verification failed:', errorData)

                // エラーコードに応じてリダイレクト
                if (errorData.error?.code === 'REGISTRATION_TOKEN_EXPIRED') {
                    return addNoCacheHeaders(NextResponse.redirect(new URL('/email-registration?error=token_expired', request.url)))
                }
                return addNoCacheHeaders(NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url)))
            }

            // バックエンドAPIから返されたredirectUrlを使用してリダイレクト
            const data = await response.json()
            if (data.redirectUrl) {
                return addNoCacheHeaders(NextResponse.redirect(data.redirectUrl))
            }

            // redirectUrlが返されない場合のフォールバック
            console.warn('🔍 [register/verify] No redirectUrl in response, using fallback')
            const registerUrl = new URL('/register', request.url)
            registerUrl.searchParams.set('token', token)

            // URLパラメータから紹介者IDを取得して含める
            const ref = request.nextUrl.searchParams.get('ref')
            if (ref) {
                registerUrl.searchParams.set('ref', ref)
            }

            if (shopIdFromQuery) {
                registerUrl.searchParams.set('shop_id', shopIdFromQuery)
            }

            return addNoCacheHeaders(NextResponse.redirect(registerUrl))
        } catch (error) {
            console.error('🔍 [register/verify] Error calling backend API:', error)
            return addNoCacheHeaders(NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url)))
        }
    } catch (error) {
        console.error('🔍 [register/verify] Error in API route:', error)
        return addNoCacheHeaders(NextResponse.redirect(new URL('/email-registration?error=verification_failed', request.url)))
    }
}
