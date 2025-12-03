'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterContainer } from '@/components/organisms/RegisterContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { 
  getRegisterSession, 
  setRegisterSessionItem, 
  removeRegisterSessionItem 
} from '@/lib/register-session'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [shopId, setShopId] = useState<string | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)
  const [initialFormData, setInitialFormData] = useState<UserRegistrationComplete | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得し、APIからメールアドレスを取得
  useEffect(() => {
    setIsClient(true)
    
    const initializePage = async () => {
      if (typeof window === 'undefined') return

      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get('token') || undefined
      const shop_id = urlParams.get('shop_id') || undefined
      const ref = urlParams.get('ref') // 紹介者IDを取得
      const isEdit = urlParams.get('edit') === 'true'
      const errorParam = urlParams.get('error') // エラーメッセージを取得
      const errorRestore = urlParams.get('error_restore') === 'true' // エラー時フォームデータ復元フラグ

      // エラーパラメータがある場合は表示
      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam)
        console.log('🔍 [register] Error parameter found:', decodedError)
        setError(decodedError)
      }

      // トークンが存在しない場合はメール登録画面にリダイレクト
      if (!tokenParam || tokenParam.trim() === '') {
        router.push('/email-registration')
        return
      }

      setToken(tokenParam)
      setShopId(shop_id)

      // URLパラメータから紹介者IDを取得してサーバーサイドセッションに保存
      if (ref) {
        await setRegisterSessionItem('referrerUserId', ref)
      }

      // 編集モードまたはエラー復元モードの場合、保存されたフォームデータを取得
      if (isEdit || errorRestore) {
        const sessionData = await getRegisterSession()
        const savedData = sessionData?.registerFormData
        if (savedData) {
          try {
            const parsedData = savedData as Partial<UserRegistrationComplete>
            // パスワードフィールドは空にする（セキュリティ上の理由）
            setInitialFormData({
              ...parsedData,
              password: '',
              passwordConfirm: '',
            } as UserRegistrationComplete)
            await removeRegisterSessionItem('registerFormData')
          } catch {
            // エラーを無視
          }
        }
        // 編集モードまたはエラー復元モードの場合、サーバーサイドセッションからメールアドレスを取得
        const savedEmail = sessionData?.registerEmail
        if (savedEmail) {
          setEmail(savedEmail)
          setIsLoadingEmail(false)
          return
        }
      }

      // トークンからメールアドレスを取得（セキュリティ改善：POSTでトークンをボディ送信）
      try {
        const response = await fetch('/api/auth/register/token-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenParam }),
        })
        
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

        const data = await response.json()
        setEmail(data.email)
        // サーバーサイドセッションにメールアドレスを保存（確認画面での復元用）
        await setRegisterSessionItem('registerEmail', data.email)
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
    setIsLoading(true)

    // shop_idを追加
    const dataWithShopId = {
      ...data,
      shop_id: shopId || undefined,
    }

    // フォームデータをサーバーサイドセッションに保存（パスワードは除外）
    const { password, passwordConfirm, ...dataWithoutPassword } = dataWithShopId
    await setRegisterSessionItem('registerFormData', dataWithoutPassword)

    // 確認画面に遷移（emailパラメータを削除 - セキュリティ改善）
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

  // トークン関連のエラー（トークンが無効など）の場合は専用画面を表示
  if (error && (!token || !email)) {
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
      errorMessage={error || undefined}
    />
  )
}
