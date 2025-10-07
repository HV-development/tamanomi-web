import { NextRequest, NextResponse } from 'next/server'

const TAMAYOI_API_URL = process.env.TAMAYOI_API_URL || 'http://localhost:3001'

export async function GET(
    request: NextRequest,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params

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
            const signupUrl = new URL('/signup', request.url)
            signupUrl.searchParams.set('email', tokenData.email)
            signupUrl.searchParams.set('token', token)

            return NextResponse.redirect(signupUrl)
        } catch (decodeError) {
            return NextResponse.redirect(new URL('/email-registration?error=invalid_token', request.url))
        }
    } catch (error) {
        return NextResponse.redirect(new URL('/email-registration?error=verification_failed', request.url))
    }
}
