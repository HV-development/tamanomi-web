import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

// お気に入り登録/削除（トグル）
export async function POST(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const authHeader = getAuthHeader(request)
    const { shopId } = params
    
    if (!authHeader) {
      console.log('❌ [favorites] No authorization header')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (!shopId) {
      return NextResponse.json(
        { error: '店舗IDが必要です' },
        { status: 400 }
      )
    }

    console.log('🔍 [favorites] Toggling favorite for shop:', shopId)

    const fullUrl = buildApiUrl(`/users/favorites/${shopId}`)
    console.log('🔍 [favorites] Backend URL:', fullUrl)

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({}), // 空のJSONオブジェクトを送信してFastifyのエラーを回避
      cache: 'no-store',
    })

    console.log('🔍 [favorites] Backend response status:', response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [favorites] Backend API error:', data)
      
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: data.message || data.error?.message || 'お気に入りの登録/削除に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('🔍 [favorites] Backend response data:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [favorites] Route error:', error)
    return NextResponse.json(
      { error: 'お気に入りの登録/削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// お気に入り削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const authHeader = getAuthHeader(request)
    const { shopId } = params
    
    if (!authHeader) {
      console.log('❌ [favorites] No authorization header')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (!shopId) {
      return NextResponse.json(
        { error: '店舗IDが必要です' },
        { status: 400 }
      )
    }

    console.log('🔍 [favorites] Deleting favorite for shop:', shopId)

    const fullUrl = buildApiUrl(`/users/favorites/${shopId}`)
    console.log('🔍 [favorites] Backend URL:', fullUrl)

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({}), // 空のJSONオブジェクトを送信してFastifyのエラーを回避
      cache: 'no-store',
    })

    console.log('🔍 [favorites] Backend response status:', response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [favorites] Backend API error:', data)
      
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: data.message || data.error?.message || 'お気に入りの削除に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('🔍 [favorites] Backend response data:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [favorites] Route error:', error)
    return NextResponse.json(
      { error: 'お気に入りの削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

