import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, userEmail, planId, customerFamilyName, customerName, companyName } = body

    // 環境情報を取得
    const apiBaseUrl = process.env.API_BASE_URL || 'not set'
    const nodeEnv = process.env.NODE_ENV || 'not set'
    const host = request.headers.get('host') || 'not set'
    const cookieHeader = request.headers.get('cookie') ? 'present' : 'missing'

    console.log('🔍 [Next.js API Route] Environment info:', {
      nodeEnv,
      apiBaseUrl,
      host,
      cookieHeader,
      hasCookie: !!request.headers.get('cookie'),
    })

    console.log('🔍 [Next.js API Route] Request body:', {
      customerId,
      userEmail,
      planId,
      bodyKeys: Object.keys(body),
    })

    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/payment/register')

    console.log('🔍 [Next.js API Route] Backend URL:', fullUrl)

    const backendRequestBody = {
      customerId,
      userEmail,
      planId,
      customerFamilyName,
      customerName,
      companyName
    }

    console.log('🔍 [Next.js API Route] Backend request body:', backendRequestBody)

    // リクエストヘッダーを構築（Cookieを転送）
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Cookieを転送（認証情報を含む）
    const cookie = request.headers.get('cookie')
    if (cookie) {
      headers['Cookie'] = cookie
    }

    console.log('🔍 [Next.js API Route] Request headers:', {
      hasCookie: !!cookie,
      cookieLength: cookie?.length || 0,
      contentType: headers['Content-Type'],
    })

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendRequestBody),
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
        } else {
          const text = await response.text()
          console.error('[api/payment/register] backend returned non-JSON response:', text.substring(0, 200))
          errorData = { message: text.substring(0, 200) }
        }
      } catch (parseError) {
        console.error('[api/payment/register] failed to parse error response:', parseError)
        errorData = { message: 'レスポンスの解析に失敗しました' }
      }

      // エラーデータの詳細をログ出力（デバッグ用に詳細情報を含める）
      console.error('❌ [api/payment/register] backend error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorMessage: errorData.message,
        errorCode: errorData.code,
        fullErrorData: JSON.stringify(errorData, null, 2),
        requestBody: backendRequestBody,
        backendUrl: fullUrl,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          apiBaseUrl: process.env.API_BASE_URL || 'not set',
          host: request.headers.get('host'),
        },
      })

      // バックエンドからのエラーメッセージを優先的に使用
      // レスポンス形式: { statusCode, code, message } または { error: { code, message } }
      const errorMessage =
        errorData.message ||
        errorData.error?.message ||
        'カード登録の準備に失敗しました'

      return NextResponse.json(
        { error: errorMessage, code: errorData.code || errorData.error?.code },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('❌ [api/payment/register] Unexpected error:', {
      error,
      errorMessage,
      errorStack,
      errorName: error instanceof Error ? error.name : 'Unknown',
    })

    return NextResponse.json(
      { error: 'カード登録の準備中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

