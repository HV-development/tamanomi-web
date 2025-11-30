import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';
import { getAuthHeader } from '@/lib/auth-header';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = getAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error('店舗紹介登録エラー:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '店舗紹介の登録中にエラーが発生しました' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error('店舗紹介取得エラー:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '店舗紹介の取得中にエラーが発生しました' } },
      { status: 500 }
    );
  }
}
