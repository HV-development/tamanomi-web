import { NextRequest } from 'next/server';
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

// サーバーサイドなのでNEXT_PUBLIC_プレフィックスなしの環境変数を使用
// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // tamanomi-apiにプロキシ
    const response = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/api/v1/contact`, {
      method: 'POST',
      headerOptions: {
        requireAuth: false, // お問い合わせは認証不要
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ お問い合わせAPI エラー:', data);
      return createNoCacheResponse(
        {
          success: false,
          message: data.message || 'お問い合わせの送信に失敗しました',
          errors: data.errors,
        },
        { status: response.status }
      );
    }

    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ お問い合わせAPI 例外エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse(
      {
        success: false,
        message: 'お問い合わせの送信中にエラーが発生しました',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
