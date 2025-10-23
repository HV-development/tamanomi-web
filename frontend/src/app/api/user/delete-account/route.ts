import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 [DeleteAccount API] DELETE request received');
    // 認証トークンを取得
    const authHeader = request.headers.get('authorization');
    console.log('🔍 [DeleteAccount API] Auth header:', !!authHeader);
    if (!authHeader) {
      console.log('🔍 [DeleteAccount API] No auth header found');
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    // タイムアウト設定付きのfetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/users/me');
    console.log('🔍 [DeleteAccount API] Sending request to:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      console.log('🔍 [DeleteAccount API] Backend response status:', response.status);

      clearTimeout(timeoutId);

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('🔍 [delete-account] Error data:', errorData);

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
    console.error('Account deletion error:', error);
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
        message: 'アカウント削除の処理に失敗しました。しばらくしてから再度お試しください。',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
