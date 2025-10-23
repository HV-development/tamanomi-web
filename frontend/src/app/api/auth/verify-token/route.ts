import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'トークンが提供されていません' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/auth/password/verify-token');

    try {
      const response = await fetch(`${fullUrl}?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || 'トークンの検証に失敗しました',
            error: errorData,
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            {
              success: false,
              message: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。',
            },
            { status: 408 }
          );
        }

        if (fetchError.message.includes('fetch') || fetchError.message.includes('Failed to fetch')) {
          return NextResponse.json(
            {
              success: false,
              message: 'サーバーに接続できません。ネットワーク接続を確認してください。',
            },
            { status: 503 }
          );
        }
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('トークン検証APIエラー:', error);
    return NextResponse.json(
      { success: false, message: 'トークン検証中に予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}
