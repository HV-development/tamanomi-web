import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';
import { getAuthHeader } from '@/lib/auth-header';

export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, validUntil } = body;

    // アクセストークンを取得
    const authHeader = getAuthHeader(request);
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    // バリデーション
    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'プランIDは必須です' },
        { status: 400 }
      );
    }


    // バックエンドAPIを呼び出し
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/plans/user-plans');

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          plan_id: planId,
          ...(validUntil && { valid_until: validUntil }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);


      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // エラーメッセージを返す
        let errorMessage = 'プラン登録に失敗しました';
        
        if (response.status === 401) {
          errorMessage = '認証エラー: ログインしてください';
        } else if (response.status === 404) {
          errorMessage = '指定されたプランが見つかりません';
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }

        return NextResponse.json(
          {
            success: false,
            message: errorMessage,
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
    console.error('❌ [user-plans/create] Error:', error);
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
        message: 'プラン登録の処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

