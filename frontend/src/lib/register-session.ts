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
 */
export async function getRegisterSessionItem<T = unknown>(key: RegisterSessionKey): Promise<T | null> {
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

