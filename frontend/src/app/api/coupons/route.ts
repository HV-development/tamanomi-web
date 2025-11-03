import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'
import { getAuthHeader } from '@/lib/auth-header'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '100'
    const status = searchParams.get('status') || 'active'
    const isPublic = searchParams.get('isPublic')

    // クエリパラメータを構築
    const queryParams = new URLSearchParams({
      page,
      limit,
      status,
    })
    
    if (shopId) {
      queryParams.append('shopId', shopId)
    }
    
    if (isPublic) {
      queryParams.append('isPublic', isPublic)
    }

    console.log('🔍 [coupons] Query params:', { shopId, page, limit, status, isPublic })
    console.log('🔍 [coupons] Query string:', queryParams.toString())

    const authHeader = getAuthHeader(request)
    
    if (!authHeader) {
      console.log('❌ [coupons] No authorization header')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const fullUrl = `${buildApiUrl('/coupons')}?${queryParams.toString()}`
    console.log('🔍 [coupons] Calling backend API:', fullUrl)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    })

    console.log('🔍 [coupons] Backend response status:', response.status)

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [coupons] Backend API error:', data)
      return NextResponse.json(
        { error: data.message || data.error?.message || 'クーポンの取得に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('✅ [coupons] Backend response success:', {
      couponsCount: data.coupons?.length || 0,
      pagination: data.pagination
    })
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [coupons] Route error:', error)
    return NextResponse.json(
      { error: 'クーポンの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

