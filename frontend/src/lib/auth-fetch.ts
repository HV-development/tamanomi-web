import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { setTokenCookies, isSecureRequest, type TokenPair } from '@/lib/token-cookie'
import type { HeaderOptions } from '@/lib/header-utils'

export interface AuthFetchResult {
  response: NextResponse
  /** リフレッシュが実行されて成功したかどうか */
  refreshed: boolean
}

/**
 * 認証付きfetch + 自動リフレッシュ（サーバーサイドAPI Route用）
 *
 * 1. 認証ヘッダー付きでバックエンドAPIにリクエスト
 * 2. 401/403 → リフレッシュトークンで自動更新を試行
 * 3. 成功 → 新トークンをCookieにセットし、元のリクエストをリトライ
 *
 * @returns { response, refreshed } responseはそのまま返却可能なNextResponse
 */
export async function authenticatedFetch(
  request: NextRequest,
  url: string,
  options: RequestInit & { headerOptions?: HeaderOptions } = {}
): Promise<AuthFetchResult> {
  const response = await secureFetchWithCommonHeaders(request, url, {
    ...options,
    headerOptions: {
      requireAuth: true,
      ...options.headerOptions,
    },
  })

  if (response.status !== 401 && response.status !== 403) {
    const data = await response.json()
    return {
      response: createNoCacheResponse(
        response.ok ? data : { error: data.message || data.error?.message || 'リクエストに失敗しました' },
        { status: response.status }
      ),
      refreshed: false,
    }
  }

  const refreshToken = getRefreshToken(request)
  if (!refreshToken) {
    return {
      response: createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      ),
      refreshed: false,
    }
  }

  const refreshUrl = buildApiUrl('/refresh')
  const refreshResponse = await secureFetchWithCommonHeaders(request, refreshUrl, {
    method: 'POST',
    headerOptions: { requireAuth: false },
    body: JSON.stringify({ refreshToken }),
  })

  if (!refreshResponse.ok) {
    return {
      response: createNoCacheResponse(
        { error: '認証トークンが無効です。再度ログインしてください。' },
        { status: 401 }
      ),
      refreshed: false,
    }
  }

  const refreshData = await refreshResponse.json() as TokenPair

  const newAuthHeader = `Bearer ${refreshData.accessToken}`
  const retryResponse = await secureFetchWithCommonHeaders(request, url, {
    ...options,
    headerOptions: {
      ...options.headerOptions,
      requireAuth: true,
      customHeaders: {
        ...options.headerOptions?.customHeaders,
        Authorization: newAuthHeader,
      },
    },
  })

  const retryData = await retryResponse.json()

  if (!retryResponse.ok) {
    return {
      response: createNoCacheResponse(
        { error: retryData.message || retryData.error?.message || 'リクエストに失敗しました' },
        { status: retryResponse.status }
      ),
      refreshed: false,
    }
  }

  const nextResponse = createNoCacheResponse(retryData, { status: 200 })
  const isSecure = isSecureRequest(request)
  setTokenCookies(nextResponse, refreshData, isSecure)

  return {
    response: nextResponse,
    refreshed: true,
  }
}
