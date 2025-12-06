import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = getAuthHeader(request)

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id: userPlanId } = await params
    if (!userPlanId) {
      return NextResponse.json(
        { success: false, message: 'ユーザープランIDが指定されていません' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/plans/user-plans/${userPlanId}`)

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        errorData.error?.message ||
        errorData.message ||
        'ユーザープランの解約に失敗しました'

      return NextResponse.json(
        { success: false, message, error: errorData },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [user-plans/:id] DELETE error:', error)
    return NextResponse.json(
      { success: false, message: 'ユーザープランの解約中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

