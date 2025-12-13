import { NextRequest, NextResponse } from 'next/server'
import { encrypt, decrypt, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session-encryption'
import { createNoCacheResponse } from '@/lib/response-utils'

/**
 * 登録セッションデータをサーバーサイドで管理するAPI
 * sessionStorageの代わりにhttpOnly Cookieを使用してセキュリティを向上
 */

/**
 * セッションデータの型定義
 */
interface RegisterSessionData {
  registerEmail?: string
  registerFormData?: Record<string, unknown>
  referrerUserId?: string
  userEmail?: string
  editFormData?: Record<string, unknown>
  otpEmail?: string // OTP認証用のメールアドレス
  otpRequestId?: string // OTP認証用のrequestId
}

/**
 * GET: セッションデータを取得
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return createNoCacheResponse({ data: null })
    }
    
    try {
      const decrypted = decrypt(sessionCookie.value)
      const data = JSON.parse(decrypted) as RegisterSessionData
      return createNoCacheResponse({ data })
    } catch {
      // 復号化に失敗した場合は空のデータを返す
      return createNoCacheResponse({ data: null })
    }
  } catch (error) {
    console.error('Session GET error:', error)
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    )
  }
}

/**
 * POST: セッションデータを保存（部分更新）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body as { key: keyof RegisterSessionData; value: unknown }
    
    if (!key) {
      return createNoCacheResponse(
        { error: { code: 'MISSING_KEY', message: 'キーが必要です' } },
        { status: 400 }
      )
    }
    
    // 既存のセッションデータを取得
    let existingData: RegisterSessionData = {}
    const sessionCookie = request.cookies.get(COOKIE_NAME)
    
    if (sessionCookie?.value) {
      try {
        const decrypted = decrypt(sessionCookie.value)
        existingData = JSON.parse(decrypted)
      } catch {
        // 復号化に失敗した場合は新しいセッションを開始
        existingData = {}
      }
    }
    
    // データを更新
    if (value === null || value === undefined) {
      delete existingData[key]
    } else {
      existingData[key] = value as RegisterSessionData[typeof key]
    }
    
    // 暗号化してCookieに保存
    const encrypted = encrypt(JSON.stringify(existingData))
    
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
    })()
    
    const response = createNoCacheResponse({ success: true })
    response.cookies.set(COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    })
    
    return response
  } catch (error) {
    console.error('Session POST error:', error)
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE: セッションデータを削除（特定のキーまたは全体）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key') as keyof RegisterSessionData | null
    
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:' } catch { return process.env.NODE_ENV === 'production' }
    })()
    
    if (key) {
      // 特定のキーのみ削除
      let existingData: RegisterSessionData = {}
      const sessionCookie = request.cookies.get(COOKIE_NAME)
      
      if (sessionCookie?.value) {
        try {
          const decrypted = decrypt(sessionCookie.value)
          existingData = JSON.parse(decrypted)
          delete existingData[key]
        } catch {
          existingData = {}
        }
      }
      
      const response = createNoCacheResponse({ success: true })
      
      if (Object.keys(existingData).length > 0) {
        const encrypted = encrypt(JSON.stringify(existingData))
        response.cookies.set(COOKIE_NAME, encrypted, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: SESSION_MAX_AGE,
        })
      } else {
        // データが空になった場合はCookieを削除
        response.cookies.set(COOKIE_NAME, '', {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        })
      }
      
      return response
    } else {
      // 全体を削除
      const response = createNoCacheResponse({ success: true })
      response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      })
      
      return response
    }
  } catch (error) {
    console.error('Session DELETE error:', error)
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    )
  }
}
