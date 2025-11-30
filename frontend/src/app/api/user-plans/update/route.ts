import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId } = body

    // アクセストークンを取得
    const authHeader = getAuthHeader(request)
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    // バリデーション
    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'プランIDは必須です' },
        { status: 400 }
      )
    }


    // バックエンドAPIを呼び出し
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト

    const fullUrl = buildApiUrl('/plans/user-plans/change')

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          planId: planId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)


      // レスポンスのステータスをチェック
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // エラーメッセージを返す
        let errorMessage = 'プラン変更に失敗しました'
        
        if (response.status === 401) {
          errorMessage = '認証エラー: ログインしてください'
        } else if (response.status === 404) {
          errorMessage = '指定されたプランが見つかりません'
        } else if (response.status === 403) {
          errorMessage = 'このプランに変更する権限がありません'
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
      return NextResponse.json(data, { status: response.status })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error('❌ [user-plans/change] Error:', error)
    return NextResponse.json(
      { success: false, message: 'プラン変更中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
