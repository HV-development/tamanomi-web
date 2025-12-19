/**
 * CORS設定ユーティリティ
 * 同一オリジンからのアクセスのみを許可
 * 将来の拡張性のため、最小限のCORS設定を提供
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * 同一オリジンからのアクセスのみを許可するCORSヘッダーを設定
 * 現在は同一オリジンなので実質的に不要だが、将来の拡張性のため提供
 * 
 * @param request NextRequestオブジェクト
 * @param response NextResponseオブジェクト（既存のレスポンスがある場合）
 * @returns CORSヘッダーが設定されたNextResponse
 */
export function setCorsHeaders(
  request: NextRequest,
  response?: NextResponse
): NextResponse {
  const corsResponse = response || new NextResponse()
  const origin = request.headers.get('origin')
  const requestHost = request.headers.get('host')
  
  // 同一オリジン（originがない、またはhostと一致）の場合のみ許可
  if (!origin || origin === `http://${requestHost}` || origin === `https://${requestHost}`) {
    if (origin) {
      corsResponse.headers.set('Access-Control-Allow-Origin', origin)
    }
    corsResponse.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  // クロスオリジンの場合は何も設定しない（ブラウザがブロック）

  return corsResponse
}

/**
 * OPTIONSリクエスト（プリフライト）を処理
 * 同一オリジンからのみ許可
 * 
 * @param request NextRequestオブジェクト
 * @returns CORSヘッダーが設定されたNextResponse
 */
export function handleOptionsRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  const origin = request.headers.get('origin')
  const requestHost = request.headers.get('host')
  
  // 同一オリジンの場合のみ許可
  if (origin && (origin === `http://${requestHost}` || origin === `https://${requestHost}`)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400') // 24時間
  }

  return response
}


