import { NextRequest } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // タイムアウト設定付きのfetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/password/reset/request');

    try {
      const response = await secureFetchWithCommonHeaders(request, fullUrl, {
        method: 'POST',
        headerOptions: {
          requireAuth: false, // パスワードリセットリクエストは認証不要
        },
        body: JSON.stringify({
          email: body.email,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 400エラー（無効なトークンなど）の場合は特別な処理
        if (response.status === 400) {
          return createNoCacheResponse(
            {
              success: false,
              message: errorData.message || 'メールアドレスが見つかりません。',
              error: errorData,
            },
            { status: 400 }
          );
        }

        return createNoCacheResponse(
          {
            success: false,
            message: errorData.message || `サーバーエラーが発生しました (${response.status})`,
            error: errorData,
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      return createNoCacheResponse(data, { status: response.status });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    // エラーの種類に応じて適切なメッセージを返す
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createNoCacheResponse(
          {
            success: false,
            message: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。',
          },
          { status: 408 }
        );
      }

      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return createNoCacheResponse(
          {
            success: false,
            message: 'サーバーに接続できません。ネットワーク接続を確認してください。',
          },
          { status: 503 }
        );
      }
    }

    return createNoCacheResponse(
      {
        success: false,
        message: 'パスワードリセットの処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
