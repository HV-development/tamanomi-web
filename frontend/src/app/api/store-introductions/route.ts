import { NextRequest } from 'next/server';
import { buildApiUrl } from '@/lib/api-config';
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify(body),
    });

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

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
    const fullUrl = buildApiUrl('/users/store-introductions');
    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
    });

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

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
