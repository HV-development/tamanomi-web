/**
 * サーバーサイド用の共通ヘッダー生成ユーティリティ
 * Next.js API Routesで使用する共通ヘッダーを自動生成
 */

import { NextRequest } from 'next/server'
import { getAuthHeader } from './auth-header'
import { randomUUID } from 'crypto'

export interface HeaderOptions {
  /**
   * 認証が必要かどうか（デフォルト: true）
   * falseの場合、認証ヘッダーは設定されない
   */
  requireAuth?: boolean
  /**
   * 追加のカスタムヘッダー
   */
  customHeaders?: Record<string, string>
  /**
   * Content-Typeを設定するかどうか（デフォルト: true）
   * FormDataを使用する場合はfalseに設定
   */
  setContentType?: boolean
}

/**
 * 共通ヘッダーを生成
 * 
 * @param request - NextRequestまたはRequestオブジェクト
 * @param options - ヘッダー生成オプション
 * @returns 共通ヘッダーオブジェクト
 */
export function buildCommonHeaders(
  request: NextRequest | Request,
  options: HeaderOptions = {}
): Record<string, string> {
  const {
    requireAuth = true,
    customHeaders = {},
    setContentType = true,
  } = options

  const headers: Record<string, string> = {}

  // Content-Typeを設定（デフォルトでapplication/json）
  if (setContentType) {
    headers['Content-Type'] = 'application/json'
  }

  // 認証ヘッダーを設定
  if (requireAuth) {
    const authHeader = getAuthHeader(request)
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
  }

  // リクエストIDを生成（トレーシング用）
  const requestId = randomUUID()
  headers['X-Request-ID'] = requestId

  // X-App-Domainヘッダーを追加（バックエンドでのアプリ判定に使用）
  // env優先。なければ受信したHostヘッダーを転送。
  const appDomain = process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_APP_DOMAIN
  if (appDomain) {
    headers['X-App-Domain'] = appDomain
  } else {
    const host = request.headers.get('host')
    if (host) {
      headers['X-App-Domain'] = host
    }
  }

  // カスタムヘッダーをマージ（後から追加されたヘッダーが優先）
  Object.assign(headers, customHeaders)

  return headers
}

/**
 * 認証不要の共通ヘッダーを生成
 * 
 * @param request - NextRequestまたはRequestオブジェクト
 * @param options - ヘッダー生成オプション
 * @returns 共通ヘッダーオブジェクト
 */
export function buildCommonHeadersWithoutAuth(
  request: NextRequest | Request,
  options: Omit<HeaderOptions, 'requireAuth'> = {}
): Record<string, string> {
  return buildCommonHeaders(request, {
    ...options,
    requireAuth: false,
  })
}

