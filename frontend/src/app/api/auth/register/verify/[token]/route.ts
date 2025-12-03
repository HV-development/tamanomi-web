import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        if (!token) {
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }

        // トークンはUUIDのみで、メールアドレスなどの個人情報は含まれない（セキュリティ改善）
        // バックエンドAPIでトークンを検証（POSTメソッドでトークンをボディ送信）
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/register/token-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('Token verification failed:', errorData)
                
                // エラーコードに応じてリダイレクト
                if (errorData.error?.code === 'REGISTRATION_TOKEN_EXPIRED') {
                    return NextResponse.redirect(new URL('/email-registration?error=token_expired', request.url))
                }
                return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
            }

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

            return NextResponse.redirect(registerUrl)
        } catch {
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }
    } catch {
        return NextResponse.redirect(new URL('/email-registration?error=verification_failed', request.url))
    }
}
