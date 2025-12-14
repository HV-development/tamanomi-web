/**
 * 登録セッションデータを管理するユーティリティ
 * httpOnly Cookieを使用してサーバーサイドでデータを保存
 */

import type { RegisterSessionKey, RegisterSessionData } from '@/types/register-session'

/**
 * セッションデータを取得
 */
export async function getRegisterSession(): Promise<RegisterSessionData | null> {
  try {
    const response = await fetch('/api/auth/register/session', {
      method: 'GET',
      credentials: 'include',
    })
    
    if (!response.ok) {
      return null
    }
    
    const result = await response.json()
    return result.data
  } catch {
    console.error('Failed to get register session')
    return null
  }
}

/**
 * セッションデータの特定のキーを取得
 * セキュリティ改善：メールアドレス関連のフィールドは専用エンドポイントを使用
 * 
 * 注意：otpEmailを取得する場合は、useVerifyOtpPageで直接専用エンドポイントを呼び出すこと
 * （requestId検証が必要なため）
 */
export async function getRegisterSessionItem<T = unknown>(key: RegisterSessionKey): Promise<T | null> {
  // メールアドレス関連のフィールドは専用エンドポイントを使用
  // otpEmailはrequestId検証が必要なため、getRegisterSessionItemでは取得できない
  // useVerifyOtpPageで直接専用エンドポイントを呼び出すこと
  if (key === 'registerEmail' || key === 'userEmail') {
    try {
      const url = new URL('/api/auth/register/session/email', window.location.origin)
      url.searchParams.set('key', key)
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!response.ok) {
        return null
      }
      
      const result = await response.json()
      return (result.data as T) ?? null
    } catch {
      console.error('Failed to get email from session')
      return null
    }
  }
  
  // otpEmailはrequestId検証が必要なため、getRegisterSessionItemでは取得できない
  // useVerifyOtpPageで直接専用エンドポイントを呼び出すこと
  if (key === 'otpEmail') {
    console.warn('otpEmailはgetRegisterSessionItemでは取得できません。専用エンドポイントを直接呼び出してください。')
    return null
  }
  
  // その他のフィールドは通常のGETエンドポイントから取得
  const data = await getRegisterSession()
  if (!data) return null
  return (data[key] as T) ?? null
}

/**
 * セッションデータを保存
 */
export async function setRegisterSessionItem(key: RegisterSessionKey, value: unknown): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/register/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ key, value }),
    })
    
    return response.ok
  } catch {
    console.error('Failed to set register session item')
    return false
  }
}

/**
 * セッションデータの特定のキーを削除
 */
export async function removeRegisterSessionItem(key: RegisterSessionKey): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/register/session?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    return response.ok
  } catch {
    console.error('Failed to remove register session item')
    return false
  }
}

/**
 * セッションデータを全て削除
 */
export async function clearRegisterSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/register/session', {
      method: 'DELETE',
      credentials: 'include',
    })
    
    return response.ok
  } catch {
    console.error('Failed to clear register session')
    return false
  }
}

