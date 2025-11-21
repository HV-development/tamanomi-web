/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeader } from '@/lib/auth-header'

// サーバーサイドなので NEXT_PUBLIC_ なしの環境変数を使用
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

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
    console.log('[api/shops] → backend:', backendUrl)

    // クライアントの Authorization ヘッダを転送（未ログイン時は未設定のまま）
    const authorization = getAuthHeader(request) || undefined

    const hasInternalSecret = Boolean(process.env.INTERNAL_API_SECRET)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/shops] has INTERNAL_API_SECRET:', hasInternalSecret)
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
      ...(process.env.INTERNAL_API_SECRET
        ? { 'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET }
        : {}),
      },
    })

    console.log('[api/shops] backend status:', response.status)

    let data: any = {}
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('[api/shops] backend payload sample:', {
        shopsCount: Array.isArray(data?.shops) ? data.shops.length : 'n/a',
        pagination: data?.pagination || null,
        hasError: !!data?.error,
      })
    }

    if (!response.ok) {
      // 500系は文言を統一
      if (response.status >= 500) {
        console.error('[api/shops] backend 5xx error:', {
          status: response.status,
          data,
        })
        return NextResponse.json(
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
      return NextResponse.json(
        {
          error: data?.error || {
            code: 'API_ERROR',
            message: data?.message || data?.error?.message || '店舗情報の取得に失敗しました',
          },
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api/shops] network error:', message)
    return NextResponse.json(
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


