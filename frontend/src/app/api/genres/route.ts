/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

// サーバーサイドなので NEXT_PUBLIC_ なしの環境変数を使用
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 公開エンドポイント（認証不要）
    // バックエンドのエンドポイントは /api/v1/genres（server.tsで登録されている）
    const backendUrl = `${API_BASE_URL}/api/v1/genres`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })


    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // 500系は文言を統一
      if (response.status >= 500) {
        return NextResponse.json(
          {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'ジャンル情報の取得に失敗しました。時間を置いて再度お試しください。',
            },
          },
          { status: 500 }
        )
      }

      // 4xx などはバックエンドのエラーをそのまま返す
      return NextResponse.json(
        {
          error: data?.error || {
            code: 'API_ERROR',
            message: data?.message || 'ジャンル情報の取得に失敗しました',
          },
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[api/genres] network error:', message)
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

