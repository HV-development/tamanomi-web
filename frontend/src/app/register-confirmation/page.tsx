'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterConfirmationContainer } from '@/components/organisms/RegisterConfirmationContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'

export default function RegisterConfirmationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)
  const [formData, setFormData] = useState<UserRegistrationComplete | null>(null)
  const [email, setEmail] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSaitamaFailedModal, setShowSaitamaFailedModal] = useState(false)
  const [pointsGranted, setPointsGranted] = useState<number | null>(null)
  const [shopId, setShopId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    
    const initializePage = async () => {
      if (typeof window === 'undefined') return

      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get('token') || ''
      const shopIdParam = urlParams.get('shop_id') || undefined

      // shopIdをstateに保存
      setShopId(shopIdParam)

      // トークンがない場合は登録画面にリダイレクト
      if (!tokenParam) {
        router.push('/email-registration')
        return
      }

      setToken(tokenParam)

      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // フォームデータがない場合は登録画面に戻す
      // メールアドレスはAPIから取得
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
          setIsLoadingEmail(false)
          return
        }

        const data = await response.json()
        setEmail(data.email)
        
        // フォームデータがない場合は登録画面に戻す
        alert('セッションが切れました。お手数ですが、再度情報を入力してください。')
        const shopIdParamForRedirect = shopIdParam ? `&shop_id=${encodeURIComponent(shopIdParam)}` : ''
        router.push(`/register?token=${encodeURIComponent(tokenParam)}${shopIdParamForRedirect}`)
      } catch {
        setError('エラーが発生しました。再度お試しください。')
        setTimeout(() => router.push('/email-registration'), 3000)
      } finally {
        setIsLoadingEmail(false)
      }
    }

    initializePage()
  }, [router])

  const handleRegister = async () => {
    if (!formData || !token) return

    setIsLoading(true)

    try {
      const saitamaAppIdValue = formData.saitamaAppId && formData.saitamaAppId.trim() !== '' ? formData.saitamaAppId.trim() : undefined;
      
      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // referrerUserIdはURLパラメータから取得するか、Cookieから取得する
      const referrerUserId = undefined; // 必要に応じてCookieから取得する実装を追加
      

      // バックエンドAPIに登録リクエストを送信
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          nickname: formData.nickname,
          postalCode: formData.postalCode,
          address: formData.address,
          birthDate: formData.birthDate,
          gender: formData.gender,
          phone: formData.phone,
          // 空文字列の場合はundefinedとして送信しない
          saitamaAppId: saitamaAppIdValue,
          // 紹介者IDを追加
          referrerUserId: referrerUserId && referrerUserId.trim() !== '' ? referrerUserId.trim() : undefined,
          token: token,
          shopId: shopId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Cookieベースの認証のみを使用（localStorageは廃止）
        // トークンはサーバー側でCookieに設定されるため、フロントエンドでの保存は不要
        // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない

        // さいたま市アプリ連携が失敗した場合（ポイント付与API失敗）
        if (result.saitamaAppLinkFailed) {
          setShowSaitamaFailedModal(true)
          return
        }

        // さいたま市アプリ連携でポイント付与があった場合はモーダルを表示
        if (result.pointsGranted) {
          setPointsGranted(result.pointsGranted)
          setShowSuccessModal(true)
        } else {
          // ポイント付与がない場合は直接プラン登録画面に遷移
          // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
          // window.location.hrefを使用して強制的に遷移
          if (typeof window !== 'undefined') {
            window.location.href = '/plan-registration'
          } else {
            router.push('/plan-registration')
          }
        }
      } else {
        // エラーハンドリング
        const errorMessage = result.message || result.error?.message || '登録に失敗しました'

        // 409エラー（既存アカウント）の場合は特別な処理
        if (response.status === 409 && result.errorCode === 'USER_ALREADY_EXISTS') {
          // ログイン画面にリダイレクト
          router.push(`/?error=already_registered`)
        } else {
          alert(errorMessage)
        }
      }
    } catch {
      alert('ネットワークエラーが発生しました。再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
    // 編集モードで登録画面に戻る（フォームデータは再入力してもらう）
    const shopIdParam = formData?.shopId ? `&shop_id=${encodeURIComponent(formData?.shopId)}` : ''
    router.push(`/register?token=${encodeURIComponent(token)}&edit=true${shopIdParam}`)
  }

  const handleLogoClick = () => router.push('/')

  const handleModalClose = () => {
    setShowSuccessModal(false)
    // モーダルを閉じた後、プラン登録画面に遷移
    // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
    // window.location.hrefを使用して強制的に遷移
    if (typeof window !== 'undefined') {
      window.location.href = '/plan-registration?saitamaAppLinked=true'
    } else {
      router.push('/plan-registration?saitamaAppLinked=true')
    }
  }

  const handleSaitamaFailedModalClose = () => {
    setShowSaitamaFailedModal(false)
    // さいたま市アプリ連携なしでプラン登録画面に遷移
    // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
    if (typeof window !== 'undefined') {
      window.location.href = '/plan-registration'
    } else {
      router.push('/plan-registration')
    }
  }

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient || isLoadingEmail || !formData) {
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
    <>
      <RegisterConfirmationContainer
        data={formData}
        email={email}
        onRegister={handleRegister}
        onEdit={handleEdit}
        onLogoClick={handleLogoClick}
        isLoading={isLoading}
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      />

      {/* ポイント付与成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="🎉 登録完了"
      >
        <div className="space-y-4">
          <p className="text-gray-700 whitespace-pre-line">
            {`さいたま市みんなのアプリとの連携が完了しました。\n\n${pointsGranted}ポイントを付与しました！\n\nお得なプランが表示されます。`}
          </p>
          <Button
            onClick={handleModalClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            確認
          </Button>
        </div>
      </Modal>

      {/* さいたま市アプリ連携失敗モーダル */}
      <Modal
        isOpen={showSaitamaFailedModal}
        onClose={handleSaitamaFailedModalClose}
        title="⚠️ 登録完了（連携エラー）"
      >
        <div className="space-y-4">
          <p className="text-gray-700 whitespace-pre-line">
            {`会員登録は完了しましたが、さいたま市みんなのアプリとの連携に失敗しました。\n\nプラン登録画面で再度連携をお試しください。`}
          </p>
          <Button
            onClick={handleSaitamaFailedModalClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            連携なしで続行
          </Button>
        </div>
      </Modal>
    </>
  )
}
