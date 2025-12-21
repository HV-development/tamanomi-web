'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterContainer } from '@/components/organisms/RegisterContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { useRegisterStore } from '@/stores/register-store'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)
  // セキュリティ改善：メールアドレスはAPIから取得せず、表示も不要
  const [email] = useState<string | undefined>(undefined)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [shopId, setShopId] = useState<string | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)
  const [initialFormData, _setInitialFormData] = useState<UserRegistrationComplete | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setFormData } = useRegisterStore()

  // クライアントサイドでのみ searchParams を取得し、APIからメールアドレスを取得
  useEffect(() => {
    setIsClient(true)
    
    const initializePage = async () => {
      if (typeof window === 'undefined') return

      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get('token') || undefined
      const shop_id = urlParams.get('shop_id') || undefined
      // const ref = urlParams.get('ref') // 紹介者IDを取得（将来使用予定）
      // const isEdit = urlParams.get('edit') === 'true' // 編集モード（将来使用予定）

      // トークンが存在しない場合はメール登録画面にリダイレクト
      if (!tokenParam || tokenParam.trim() === '') {
        router.push('/email-registration')
        return
      }

      setToken(tokenParam)
      setShopId(shop_id)

      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // referrerUserIdはURLパラメータから直接取得するか、Cookieに保存する
      // 編集モードの場合、フォームデータはCookieから取得するか、再入力してもらう
      // セキュリティ改善：メールアドレスはAPIから取得せず、トークンの有効性のみをチェック

      // トークンの有効性をチェック（セキュリティ改善：メールアドレスはレスポンスに含まれない）
      try {
        const response = await fetch(`/api/auth/register/token-info?token=${encodeURIComponent(tokenParam)}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (errorData.error?.code === 'REGISTRATION_TOKEN_EXPIRED') {
            setError('トークンの有効期限が切れています。再度メール登録からやり直してください。')
          } else {
            setError('トークンが無効です。再度メール登録からやり直してください。')
          }
          setTimeout(() => router.push('/email-registration'), 3000)
          return
        }

        // トークンが有効であることを確認（メールアドレスは取得しない）
        const data = await response.json()
        if (!data.valid) {
          setError('トークンが無効です。再度メール登録からやり直してください。')
          setTimeout(() => router.push('/email-registration'), 3000)
          return
        }
        // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      } catch {
        setError('エラーが発生しました。再度お試しください。')
        setTimeout(() => router.push('/email-registration'), 3000)
      } finally {
        setIsLoadingEmail(false)
      }
    }

    initializePage()
  }, [router])

  const handleRegisterSubmit = async (data: UserRegistrationComplete) => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    setIsLoading(true)

    // フォームデータをZustandストアに保存（メモリのみ、ネットワーク経由で送信されない）
    setFormData(data)
    
    // デバッグ: 保存されたデータを確認
    const savedData = useRegisterStore.getState().formData
    
    // 確認画面に遷移（クライアントサイドのみ）
    // 次のイベントループで遷移することで、Zustandストアへの保存が確実に完了する
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const shopIdParam = shopId ? `&shop_id=${encodeURIComponent(shopId)}` : ''
    router.push(`/register-confirmation?token=${encodeURIComponent(token || '')}${shopIdParam}`)
    setIsLoading(false)
  }

  const handleCancel = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient || isLoadingEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">メール登録画面にリダイレクトします...</p>
        </div>
      </div>
    )
  }

  return (
    <RegisterContainer
      email={email}
      initialFormData={initialFormData}
      onSubmit={handleRegisterSubmit}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
      backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
    />
  )
}
