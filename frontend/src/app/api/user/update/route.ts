import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 認証トークンを取得
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    // バリデーション
    if (!body.nickname || !body.postalCode || !body.address || !body.birthDate || !body.gender) {
      return NextResponse.json(
        { success: false, message: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    console.log('🔍 [user/update] Updating user profile:', body)

    // バックエンドAPIを呼び出し
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/users/me')
    console.log('🔍 [user/update] Request URL:', fullUrl)

    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('🔍 [user/update] Response status:', response.status)

      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('🔍 [user/update] Error data:', errorData)

        // エラーメッセージを返す
        let errorMessage = 'プロフィール更新に失敗しました'
        
        if (response.status === 401) {
          errorMessage = '認証エラー: ログインしてください'
        } else if (response.status === 403) {
          errorMessage = '更新する権限がありません'
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }

        return NextResponse.json(
          {
            success: false,
            message: errorMessage,
            error: errorData,
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('🔍 [user/update] Success:', data)
      return NextResponse.json({ success: true, data }, { status: response.status })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error('❌ [user/update] Error:', error)
    return NextResponse.json(
      { success: false, message: 'プロフィール更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

