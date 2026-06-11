import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getRefreshToken } from '@/lib/auth-header'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'
import { clearTokenCookies, setTokenCookies, isSecureRequest, type TokenPair } from '@/lib/token-cookie'
import type { HeaderOptions } from '@/lib/header-utils'

const TRANSIENT_STATUS = 503
const TRANSIENT_BACKOFFS_MS = [500, 1000, 2000]

/**
 * 503（DB起動待ち等の一時的エラー）の場合のみ短いバックオフで再試行する。
 * ログアウト判定（401/403）には影響しない。
 */
async function fetchWithTransientRetry(doFetch: () => Promise<Response>): Promise<Response> {
  let response = await doFetch()
  for (const delay of TRANSIENT_BACKOFFS_MS) {
    if (response.status !== TRANSIENT_STATUS) break
    await new Promise((resolve) => setTimeout(resolve, delay))
    response = await doFetch()
  }
  return response
}

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
  const response = await fetchWithTransientRetry(() =>
    secureFetchWithCommonHeaders(request, url, {
      ...options,
      headerOptions: {
        requireAuth: true,
        ...options.headerOptions,
      },
    })
  )

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
    const nextResponse = createNoCacheResponse(
      { error: '認証が必要です' },
      { status: 401 }
    )
    clearTokenCookies(nextResponse, isSecureRequest(request))
    return {
      response: nextResponse,
      refreshed: false,
    }
  }

  const refreshUrl = buildApiUrl('/refresh')
  const refreshResponse = await fetchWithTransientRetry(() =>
    secureFetchWithCommonHeaders(request, refreshUrl, {
      method: 'POST',
      headerOptions: { requireAuth: false },
      body: JSON.stringify({ refreshToken }),
    })
  )

  if (!refreshResponse.ok) {
    const status = refreshResponse.status === 503 ? 503 : 401
    const error =
      status === 503
        ? 'サーバーが混み合っています。しばらくしてから再試行してください。'
        : '認証トークンが無効です。再度ログインしてください。'
    const nextResponse = createNoCacheResponse({ error }, { status })
    if (status === 401) {
      clearTokenCookies(nextResponse, isSecureRequest(request))
    }
    return {
      response: nextResponse,
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
