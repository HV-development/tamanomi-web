/**
 * 認証関連のAPIクライアント
 */

import { apiPost } from '@/lib/api'

export interface PreRegisterRequest {
  email: string
  campaignCode?: string
}

export interface PreRegisterResponse {
  success: boolean
  message: string
}

/**
 * メールアドレスの事前登録APIを呼び出す
 * 登録確認メールが送信される
 */
export async function preRegister(
  email: string,
  campaignCode?: string
): Promise<PreRegisterResponse> {
  try {
    const data = await apiPost<PreRegisterResponse>('/api/auth/pre-register', {
      email,
      campaignCode,
    })

    console.log('preRegister success data:', data)
    return data
  } catch (error) {
    console.error('preRegister error:', error)
    // ネットワークエラーなど、fetch自体が失敗した場合
    if (error instanceof Error) {
      throw error
    }
    throw new Error('認証メールの送信中にエラーが発生しました')
  }
}

