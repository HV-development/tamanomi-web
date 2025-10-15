import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

// サーバーサイドでは API_BASE_URL を使用（NEXT_PUBLIC_ プレフィックスなし）
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

    // デバッグ: 環境変数の確認
    console.log('Environment check:', {
      API_BASE_URL: process.env.API_BASE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      finalBaseUrl: baseUrl,
      NODE_ENV: process.env.NODE_ENV
    });

    // バリデーション
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスは必須です' },
        { status: 400 }
      );
    }

    // タイムアウト設定付きのfetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const fullUrl = `${baseUrl}/api/v1/pre-register`;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          campaignCode: body.campaignCode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json(
          {
            success: false,
            message: errorData.message || `サーバーエラーが発生しました (${response.status})`,
            error: errorData,
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Pre-registration error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    // エラーの種類に応じて適切なメッセージを返す
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            message: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。',
          },
          { status: 408 }
        );
      }

      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return NextResponse.json(
          {
            success: false,
            message: 'サーバーに接続できません。ネットワーク接続を確認してください。',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'リクエストの処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

