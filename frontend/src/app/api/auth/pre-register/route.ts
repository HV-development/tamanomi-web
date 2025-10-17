import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const fullUrl = buildApiUrl('/pre-register');
    
    console.log('🔍 [pre-register] Request:', { url: fullUrl, email: body.email, campaignCode: body.campaignCode });

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

      console.log('🔍 [pre-register] Response status:', response.status);
      console.log('🔍 [pre-register] Response ok:', response.ok);

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('🔍 [pre-register] Error data:', errorData);

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

