import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        if (!token) {
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }

        // トークンをデコードして検証
        try {
            // Base64URLデコード
            const paddedToken = token + '='.repeat((4 - token.length % 4) % 4)
                .replace(/-/g, '+')
                .replace(/_/g, '/')

            const decodedToken = Buffer.from(paddedToken, 'base64').toString('utf-8')
            const tokenData = JSON.parse(decodedToken)

            // 有効期限チェック
            if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
                return NextResponse.redirect(new URL('/email-registration?error=token_expired', request.url))
            }

            // メールアドレスとトークンを含むクエリパラメータで新規登録画面にリダイレクト
            const registerUrl = new URL('/register', request.url)
            registerUrl.searchParams.set('email', tokenData.email)
            registerUrl.searchParams.set('token', token)
            
            // URLパラメータから紹介者IDを取得して含める
            const ref = request.nextUrl.searchParams.get('ref')
            if (ref) {
              registerUrl.searchParams.set('ref', ref)
            }

            return NextResponse.redirect(registerUrl)
        } catch {
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }
    } catch {
        return NextResponse.redirect(new URL('/email-registration?error=verification_failed', request.url))
    }
}
