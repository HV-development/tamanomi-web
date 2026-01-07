/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server'
import { getAuthHeader } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

// サーバーサイドなので NEXT_PUBLIC_ なしの環境変数を使用
// api-config.tsから変換済みのAPI_BASE_URLをインポート（Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み）
import { API_BASE_URL } from '@/lib/api-config'

// タイムアウト用のAbortControllerを作成するヘルパー関数
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  // タイムアウトが完了したらクリーンアップ
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId))
  return controller.signal
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '5'
    const city = searchParams.get('city')
    const genreId = searchParams.get('genreId')

    // クエリパラメータを構築
    const backendParams = new URLSearchParams({
      page,
      limit,
    })
    
    // フィルターパラメータを追加
    if (city) {
      backendParams.append('city', city)
    }
    if (genreId) {
      backendParams.append('genreId', genreId)
    }

    // 公開エンドポイントに切替（未ログインでも取得可能）
    const backendUrl = `${API_BASE_URL}/api/v1/public/shops?${backendParams.toString()}`

    // クライアントの Authorization ヘッダを転送（未ログイン時は未設定のまま）
    const authorization = getAuthHeader(request) || undefined

    let response: Response
    try {
      // タイムアウト設定（30秒）- AbortSignal.timeout()のフォールバック
      const timeoutSignal = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? AbortSignal.timeout(30000)
        : createTimeoutSignal(30000)
      
      // 認証がオプショナルなので、authorizationがあるかどうかでrequireAuthを設定
      response = await secureFetchWithCommonHeaders(request, backendUrl, {
        method: 'GET',
        headerOptions: {
          requireAuth: !!authorization, // 認証ヘッダーがある場合のみ認証が必要
        },
        signal: timeoutSignal,
      })
      
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
      const errorName = fetchError instanceof Error ? fetchError.name : 'Unknown'
      const errorCause = fetchError instanceof Error && 'cause' in fetchError 
        ? (fetchError as any).cause 
        : undefined
      
      console.error('[api/shops] Fetch failed:', {
        error: errorMessage,
        errorName,
        errorCause,
        backendUrl,
        API_BASE_URL,
        timestamp: new Date().toISOString(),
      })
      
      // より詳細なエラーメッセージを提供
      let userMessage = 'バックエンドAPIへの接続に失敗しました'
      if (errorName === 'TypeError' && errorMessage.includes('fetch failed')) {
        userMessage = 'バックエンドAPIサーバーに接続できません。APIサーバーが起動しているか確認してください。'
      } else if (errorName === 'AbortError') {
        userMessage = 'リクエストがタイムアウトしました。しばらく待ってから再度お試しください。'
      }
      
      return createNoCacheResponse(
        {
          error: {
            code: 'NETWORK_ERROR',
            message: userMessage,
            detail: errorMessage,
            backendUrl,
          },
        },
        { status: 500 }
      )
    }

    interface ShopData {
      shops?: unknown[];
      total?: number;
      error?: unknown;
    }
    let data: ShopData = {}
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('[api/shops] backend returned non-JSON response:', text.substring(0, 200))
        data = { message: text.substring(0, 200) }
      }
    } catch (parseError) {
      console.error('[api/shops] failed to parse response:', parseError)
      data = { message: 'レスポンスの解析に失敗しました' }
    }

    if (!response.ok) {
      // 500系は文言を統一
      if (response.status >= 500) {
        console.error('[api/shops] backend 5xx error:', {
          status: response.status,
          data,
        })
        return createNoCacheResponse(
          {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: data?.error?.message || data?.message || '店舗情報の取得に失敗しました。時間を置いて再度お試しください。',
            },
          },
          { status: 500 }
        )
      }

      // 4xx などはバックエンドのエラーをそのまま返す
      console.error('[api/shops] backend 4xx error:', {
        status: response.status,
        data,
      })
      return createNoCacheResponse(
        {
          error: data?.error || {
            code: 'API_ERROR',
            message: data?.message || data?.error?.message || '店舗情報の取得に失敗しました',
          },
        },
        { status: response.status }
      )
    }

    return createNoCacheResponse(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api/shops] network error:', message)
    return createNoCacheResponse(
      {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました',
          detail: message,
        },
      },
      { status: 500 }
    )
  }
}
