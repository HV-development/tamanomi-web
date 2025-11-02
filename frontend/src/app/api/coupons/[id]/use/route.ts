import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('❌ [coupons/[id]/use] No authorization header');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { shopId } = body
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopIdパラメータが必要です' },
        { status: 400 }
      )
    }

    console.log('🔍 [coupons/[id]/use] Calling backend API with couponId:', id, 'shopId:', shopId);

    const fullUrl = buildApiUrl(`/coupons/${id}/use`)
    console.log('🔍 [coupons/[id]/use] Backend URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ shopId }),
      cache: 'no-store',
    })

    console.log('🔍 [coupons/[id]/use] Backend response status:', response.status);

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [coupons/[id]/use] Backend API error:', data)
      return NextResponse.json(
        { error: data.message || data.error?.message || 'クーポンの使用に失敗しました' },
        { status: response.status }
      )
    }
    
    console.log('✅ [coupons/[id]/use] Backend response success:', data);
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [coupons/[id]/use] Route error:', error)
    return NextResponse.json(
      { error: 'クーポンの使用中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

