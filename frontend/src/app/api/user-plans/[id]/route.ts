import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userPlanId } = await params
    if (!userPlanId) {
      return createNoCacheResponse(
        { success: false, message: 'ユーザープランIDが指定されていません' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/plans/user-plans/${userPlanId}`)

    const response = await secureFetchWithCommonHeaders(request, fullUrl, {
      method: 'DELETE',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
    })

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData.error?.message ||
        errorData.message ||
        'ユーザープランの解約に失敗しました'

      return createNoCacheResponse(
        { success: false, message, error: errorData },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))

    return createNoCacheResponse(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [user-plans/:id] DELETE error:', error)
    return createNoCacheResponse(
      { success: false, message: 'ユーザープランの解約中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
