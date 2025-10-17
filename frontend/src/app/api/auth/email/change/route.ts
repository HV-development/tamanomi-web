import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// サーバーサイドでは API_BASE_URL を使用（NEXT_PUBLIC_ プレフィックスなし）
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
        const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

        // バリデーション
        if (!body.currentPassword || !body.newEmail || !body.confirmEmail) {
            return NextResponse.json(
                { error: { message: '現在のパスワード、新しいメールアドレス、確認メールアドレスは必須です' } },
                { status: 400 }
            );
        }

        // メールアドレスの一致確認
        if (body.newEmail !== body.confirmEmail) {
            return NextResponse.json(
                { error: { message: '新しいメールアドレスと確認メールアドレスが一致しません' } },
                { status: 400 }
            );
        }

        // 開発環境での認証バイパス機能
        const isDevelopment = process.env.NODE_ENV === 'development';
        const bypassAuth = process.env.BYPASS_AUTH === 'true';

        let token = '';
        if (isDevelopment && bypassAuth) {
            // 開発環境で認証バイパスが有効な場合、ダミートークンを使用
            token = 'dev-bypass-token';
        } else {
            // 本番環境または認証バイパスが無効な場合、通常の認証処理
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { error: { message: '認証トークンが必要です' } },
                    { status: 401 }
                );
            }
            token = authHeader.substring(7); // "Bearer " を除去
        }

        // タイムアウト設定付きのfetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

        const fullUrl = `${baseUrl}/api/v1/auth/email/change`;

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: body.currentPassword,
                    newEmail: body.newEmail,
                    confirmEmail: body.confirmEmail,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const responseData = await response.json();

            if (!response.ok) {
                return NextResponse.json(
                    { error: responseData.error || { message: 'メールアドレス変更に失敗しました' } },
                    { status: response.status }
                );
            }

            return NextResponse.json(responseData);
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { error: { message: 'リクエストがタイムアウトしました' } },
                    { status: 408 }
                );
            }

            throw fetchError;
        }
    } catch (error) {
        return NextResponse.json(
            { error: { message: 'メールアドレス変更に失敗しました' } },
            { status: 500 }
        );
    }
}
