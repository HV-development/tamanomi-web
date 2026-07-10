import { NextRequest } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { authenticatedFetch } from '@/lib/auth-fetch'
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
        { error: 'ユーザープランIDが指定されていません' },
        { status: 400 }
      )
    }

    const fullUrl = buildApiUrl(`/plans/user-plans/${userPlanId}`)

    const { response } = await authenticatedFetch(request, fullUrl, {
      method: 'DELETE',
      headerOptions: {
        requireAuth: true,
      },
    })

    return response
  } catch (error) {
    console.error('❌ [user-plans/:id] DELETE error:', error)
    return createNoCacheResponse(
      { error: 'ユーザープランの解約中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
