import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('❌ [user/me] No authorization header');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('🔍 [user/me] Authorization header found, calling backend API');

    const fullUrl = buildApiUrl('/users/me')
    console.log('🔍 [user/me] Backend URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    })

    console.log('🔍 [user/me] Backend response status:', response.status);

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [user/me] Backend API error:', data)
      
      // 403エラーの場合（アカウントタイプ不一致）は特別に処理
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'この機能はユーザーアカウント専用です' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: data.message || data.error?.message || 'ユーザー情報の取得に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('🔍 [user/me] Backend response data:', data);
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [user/me] Route error:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}


