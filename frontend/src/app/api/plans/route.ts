import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = searchParams.get('limit') || '50'
    
    const fullUrl = `${API_BASE_URL}/api/v1/plans?status=${status}&limit=${limit}`
    
    console.log('Plans API request:', {
      method: 'GET',
      url: fullUrl,
      status,
      limit
    })
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Plans API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Plans API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'プランの取得に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Plans data received:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Plans API fetch error:', error)
    return NextResponse.json(
      { error: 'プランの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
