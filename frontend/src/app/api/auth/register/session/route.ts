import { NextRequest, NextResponse } from 'next/server'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

/**
 * 登録セッションデータをサーバーサイドで管理するAPI
 * sessionStorageの代わりにhttpOnly Cookieを使用してセキュリティを向上
 */

const COOKIE_NAME = 'register_session'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16

// セッション有効期限（30分）
const SESSION_MAX_AGE = 30 * 60

/**
 * 暗号化キーを生成
 */
function getEncryptionKey(salt: Buffer): Buffer {
  const secret = process.env.SESSION_SECRET || 'default-dev-secret-key-change-in-production'
  return scryptSync(secret, salt, 32)
}

/**
 * データを暗号化
 */
function encrypt(data: string): string {
  const salt = randomBytes(SALT_LENGTH)
  const key = getEncryptionKey(salt)
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  
  // salt + iv + authTag + encrypted data を結合
  return salt.toString('hex') + iv.toString('hex') + authTag.toString('hex') + encrypted
}

/**
 * データを復号化
 */
function decrypt(encryptedData: string): string {
  // salt + iv + authTag + encrypted data を分離
  const salt = Buffer.from(encryptedData.slice(0, SALT_LENGTH * 2), 'hex')
  const iv = Buffer.from(encryptedData.slice(SALT_LENGTH * 2, SALT_LENGTH * 2 + IV_LENGTH * 2), 'hex')
  const authTag = Buffer.from(encryptedData.slice(SALT_LENGTH * 2 + IV_LENGTH * 2, SALT_LENGTH * 2 + IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), 'hex')
  const encrypted = encryptedData.slice(SALT_LENGTH * 2 + IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2)
  
  const key = getEncryptionKey(salt)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * セッションデータの型定義
 */
interface RegisterSessionData {
  registerEmail?: string
  registerFormData?: Record<string, unknown>
  referrerUserId?: string
  userEmail?: string
  editFormData?: Record<string, unknown>
}

/**
 * GET: セッションデータを取得
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ data: null })
    }
    
    try {
      const decrypted = decrypt(sessionCookie.value)
      const data = JSON.parse(decrypted) as RegisterSessionData
      return NextResponse.json({ data })
    } catch {
      // 復号化に失敗した場合は空のデータを返す
      return NextResponse.json({ data: null })
    }
  } catch (error) {
    console.error('Session GET error:', error)
    return NextResponse.json(
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
      return NextResponse.json(
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
    
    const response = NextResponse.json({ success: true })
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
    return NextResponse.json(
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
      
      const response = NextResponse.json({ success: true })
      
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
      const response = NextResponse.json({ success: true })
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
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    )
  }
}



