import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

// お気に入り一覧取得
export async function GET(request: NextRequest) {
  try {
    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const fullUrl = buildApiUrl('/users/favorites')

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: data.message || data.error?.message || 'お気に入り一覧の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [favorites] Route error:', error)
    return NextResponse.json(
      { error: 'お気に入り一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

