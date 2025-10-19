/**
 * 認証関連のAPIクライアント
 */

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
    const response = await fetch('/api/auth/pre-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        campaignCode,
      }),
    })

    // デバッグログ
    console.log('preRegister response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // エラーメッセージの正規化
      const message = errorData.error?.message || errorData.message || '認証メールの送信に失敗しました'
      throw new Error(message)
    }

    const data = await response.json()
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

