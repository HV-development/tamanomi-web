import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

// お気に入り登録/削除（トグル）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    if (!shopId) {
      return createNoCacheResponse(
        { error: '店舗IDが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/users/favorites/${shopId}`)

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'POST',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify({}), // 空のJSONオブジェクトを送信してFastifyのエラーを回避
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [favorites] Backend API error:', data)
      
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return createNoCacheResponse(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'お気に入りの登録/削除に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [favorites] Route error:', error)
    return createNoCacheResponse(
      { error: 'お気に入りの登録/削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// お気に入り削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    if (!shopId) {
      return createNoCacheResponse(
        { error: '店舗IDが必要です' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/users/favorites/${shopId}`)

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'DELETE',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify({}), // 空のJSONオブジェクトを送信してFastifyのエラーを回避
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [favorites] Backend API error:', data)
      
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return createNoCacheResponse(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return createNoCacheResponse(
        { error: data.message || data.error?.message || 'お気に入りの削除に失敗しました' },
        { status: response.status }
      )
    }
    
    return createNoCacheResponse(data)

  } catch (error) {
    console.error('❌ [favorites] Route error:', error)
    return createNoCacheResponse(
      { error: 'お気に入りの削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
