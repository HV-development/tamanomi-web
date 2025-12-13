import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';
import { getAuthHeader } from '@/lib/auth-header';
import { secureFetchWithAuth } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = getAuthHeader(request);

    if (!authHeader) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await secureFetchWithAuth(fullUrl, authHeader, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return createNoCacheResponse(data, { status: response.status });
  } catch (error: unknown) {
    console.error('店舗紹介登録エラー:', error);
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '店舗紹介の登録中にエラーが発生しました' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request);

    if (!authHeader) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await secureFetchWithAuth(fullUrl, authHeader, { method: 'GET' });

    const data = await response.json();
    return createNoCacheResponse(data, { status: response.status });
  } catch (error: unknown) {
    console.error('店舗紹介取得エラー:', error);
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '店舗紹介の取得中にエラーが発生しました' } },
      { status: 500 }
    );
  }
}
