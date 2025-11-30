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

      // まずsessionStorageからフォームデータを取得
      const storedData = sessionStorage.getItem('registerFormData')

      if (storedData) {
        // sessionStorageにデータがある場合（通常フロー）
        try {
          const parsedData = JSON.parse(storedData) as UserRegistrationComplete
          // shop_idがURLパラメータにある場合は上書き
          if (shopIdParam) {
            parsedData.shopId = shopIdParam
          }
          setFormData(parsedData)

          // メールアドレスをセッションストレージから取得（セキュリティ改善：URLパラメータから削除）
          const storedEmail = sessionStorage.getItem('registerEmail')
          if (storedEmail) {
            setEmail(storedEmail)
            setIsLoadingEmail(false)
            return
          }

          // セッションストレージにメールアドレスがない場合、APIから取得
          try {
            const response = await fetch(`/api/auth/register/token-info?token=${encodeURIComponent(tokenParam)}`)
            if (response.ok) {
              const data = await response.json()
              setEmail(data.email)
              sessionStorage.setItem('registerEmail', data.email)
            } else {
              throw new Error('Failed to fetch email')
            }
          } catch {
            // APIからも取得できない場合、登録画面に戻す
            alert('セッションが切れました。お手数ですが、再度情報を入力してください。')
            const shopIdParamForRedirect = shopIdParam ? `&shop_id=${encodeURIComponent(shopIdParam)}` : ''
            router.push(`/register?token=${encodeURIComponent(tokenParam)}${shopIdParamForRedirect}`)
            return
          }
          
          setIsLoadingEmail(false)
          return
        } catch (err) {
          console.error('sessionStorage parse error:', err)
          // パースエラーの場合は次の処理へ
        }
      }

      // sessionStorageがない場合、APIからメールアドレスを取得して登録画面に戻す
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

        // ユーザーに情報を再入力してもらうため、登録画面に戻す
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
      
      // セッションストレージから紹介者IDを取得
      const referrerUserId = typeof window !== 'undefined' 
        ? sessionStorage.getItem('referrerUserId') 
        : null;
      

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

        // 登録成功後はセッションストレージをクリア
        sessionStorage.removeItem('registerFormData')
        sessionStorage.removeItem('referrerUserId')
        sessionStorage.removeItem('registerEmail')

        // さいたま市アプリ連携でポイント付与があった場合はモーダルを表示
        if (result.pointsGranted) {
          setPointsGranted(result.pointsGranted)
          setShowSuccessModal(true)
        } else {
          // ポイント付与がない場合は直接プラン登録画面に遷移（セッションストレージにメールアドレスを保存）
          sessionStorage.setItem('userEmail', email)
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
    // フォームデータをsessionStorageに保存してから登録画面に戻る（emailパラメータは含めない - セキュリティ改善）
    if (formData) {
      sessionStorage.setItem('editFormData', JSON.stringify(formData))
    }
    const shopIdParam = formData?.shopId ? `&shop_id=${encodeURIComponent(formData?.shopId)}` : ''
    router.push(`/register?token=${encodeURIComponent(token)}&edit=true${shopIdParam}`)
  }

  const handleLogoClick = () => router.push('/')

  const handleModalClose = () => {
    setShowSuccessModal(false)
    // モーダルを閉じた後、プラン登録画面に遷移（セッションストレージにメールアドレスを保存）
    sessionStorage.setItem('userEmail', email)
    // window.location.hrefを使用して強制的に遷移
    if (typeof window !== 'undefined') {
      window.location.href = '/plan-registration?saitamaAppLinked=true'
    } else {
      router.push('/plan-registration?saitamaAppLinked=true')
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
    </>
  )
}
