'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterConfirmationContainer } from '@/components/organisms/RegisterConfirmationContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import {
  getRegisterSession,
  setRegisterSessionItem,
  clearRegisterSession
} from '@/lib/register-session'

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
  const [referrerUserId, setReferrerUserId] = useState<string | null>(null)
  const router = useRouter()
  // セッションデータを保持するref（handleRegisterで使用）
  const sessionDataRef = useRef<{ referrerUserId?: string } | null>(null)

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

      // サーバーサイドセッションからデータを取得
      const sessionData = await getRegisterSession()

      // 紹介者IDをrefに保存（handleRegisterで使用）
      if (sessionData?.referrerUserId) {
        sessionDataRef.current = { referrerUserId: sessionData.referrerUserId }
        setReferrerUserId(sessionData.referrerUserId)
      }

      const storedData = sessionData?.registerFormData

      console.log('🔍 [register-confirmation] Session data:', {
        hasSessionData: !!sessionData,
        hasRegisterFormData: !!storedData,
        hasRegisterEmail: !!sessionData?.registerEmail,
      })

      if (storedData) {
        // サーバーサイドセッションにデータがある場合（通常フロー）
        try {
          const parsedData = storedData as UserRegistrationComplete
          // shop_idがURLパラメータにある場合は上書き
          if (shopIdParam) {
            parsedData.shopId = shopIdParam
          }
          setFormData(parsedData)

          // メールアドレスをサーバーサイドセッションから取得（オプション）
          // セキュリティ改善：メールアドレスはトークンから取得されるため、セッションにない場合でも問題ない
          const storedEmail = sessionData?.registerEmail
          if (storedEmail) {
            setEmail(storedEmail)
          }
          // メールアドレスがセッションにない場合でも処理を続行（トークンから取得されるため）

          console.log('✅ [register-confirmation] Form data loaded from session')
          setIsLoadingEmail(false)
          return
        } catch (err) {
          console.error('❌ [register-confirmation] Session data parse error:', err)
          // パースエラーの場合は次の処理へ
        }
      }

      // セッションデータがない場合は登録画面に戻す
      console.error('❌ [register-confirmation] No session data found')
      alert('セッションが切れました。お手数ですが、再度情報を入力してください。')
      const shopIdParamForRedirect = shopIdParam ? `&shop_id=${encodeURIComponent(shopIdParam)}` : ''
      router.push(`/register?token=${encodeURIComponent(tokenParam)}${shopIdParamForRedirect}`)
      setIsLoadingEmail(false)
    }

    initializePage()
  }, [router])

  const handleRegister = async () => {
    if (!formData || !token) return

    setIsLoading(true)

    try {
      const saitamaAppIdValue = formData.saitamaAppId && formData.saitamaAppId.trim() !== '' ? formData.saitamaAppId.trim() : undefined;

      // サーバーサイドセッションから取得した紹介者IDを使用
      const referrerUserIdValue = sessionDataRef.current?.referrerUserId || referrerUserId;

      // 送信データを準備
      const requestData: any = {
        // email: email, // セキュリティ改善：メールアドレスはトークンから取得されるため、リクエストボディに含めない
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        nickname: formData.nickname,
        postalCode: formData.postalCode,
        address: formData.address,
        birthDate: formData.birthDate,
        gender: formData.gender,
        token: token,
      }

      // phoneはオプショナルなので、空文字列の場合は送信しない
      if (formData.phone && formData.phone.trim() !== '') {
        requestData.phone = formData.phone.trim()
      }

      // 空文字列の場合はundefinedとして送信しない
      if (saitamaAppIdValue) {
        requestData.saitamaAppId = saitamaAppIdValue
      }

      // 紹介者IDを追加（空文字列の場合は送信しない）
      if (referrerUserIdValue && referrerUserIdValue.trim() !== '') {
        requestData.referrerUserId = referrerUserIdValue.trim()
      }

      // shopIdを追加（存在する場合のみ）
      if (shopId) {
        requestData.shopId = shopId
      }

      // バックエンドAPIに登録リクエストを送信
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      let result: any
      try {
        result = await response.json()
      } catch (jsonError) {
        alert('サーバーエラーが発生しました。再度お試しください。')
        setIsLoading(false)
        return
      }

      if (response.ok) {
        // Cookieベースの認証のみを使用（localStorageは廃止）
        // トークンはサーバー側でCookieに設定されるため、フロントエンドでの保存は不要

        // 登録成功後はサーバーサイドセッションをクリア
        await clearRegisterSession()

        // さいたま市アプリ連携でポイント付与があった場合はモーダルを表示
        if (result.pointsGranted) {
          setPointsGranted(result.pointsGranted)
          setShowSuccessModal(true)
        } else {
          // セキュリティ改善：メールアドレスをセッションに保存しない
          // プラン登録画面では、APIから直接メールアドレスを取得する
          // window.location.hrefを使用して強制的に遷移
          if (typeof window !== 'undefined') {
            window.location.href = '/plan-registration'
          } else {
            router.push('/plan-registration')
          }
        }
      } else {
        // エラーハンドリング
        const errorCode = result.error?.code || result.errorCode
        const errorMessage = result.message || result.error?.message || '登録に失敗しました'

        // 409エラー（既存アカウント）の場合は特別な処理
        if (response.status === 409 && (errorCode === 'USER_ALREADY_EXISTS' || errorCode === 'SAITAMA_APP_ID_ALREADY_EXISTS')) {
          if (errorCode === 'USER_ALREADY_EXISTS') {
            // ログイン画面にリダイレクト
            router.push(`/?error=already_registered`)
          } else {
            // さいたま市アプリID重複の場合は新規登録画面に戻す
            const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
            const shopIdParam = shopId ? `&shop_id=${encodeURIComponent(shopId)}` : ''
            const errorParam = `&error=${encodeURIComponent(errorMessage)}`
            const redirectUrl = `/register${tokenParam}${shopIdParam}${errorParam}`
            // 強制的にリダイレクト
            if (typeof window !== 'undefined') {
              window.location.href = redirectUrl
            } else {
              router.push(redirectUrl)
            }
          }
        } else if (response.status === 500 && errorCode === 'POINT_GRANT_FAILED') {
          // ポイント付与失敗の場合は新規登録画面に戻す
          const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
          const shopIdParam = shopId ? `&shop_id=${encodeURIComponent(shopId)}` : ''
          const errorParam = `&error=${encodeURIComponent(errorMessage)}`
          const redirectUrl = `/register${tokenParam}${shopIdParam}${errorParam}`
          // 強制的にリダイレクト
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl
          } else {
            router.push(redirectUrl)
          }
        } else {
          // その他のエラー
          alert(errorMessage)
        }
      }
    } catch {
      alert('ネットワークエラーが発生しました。再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    // フォームデータをサーバーサイドセッションに保存してから登録画面に戻る（emailパラメータは含めない - セキュリティ改善）
    if (formData) {
      await setRegisterSessionItem('editFormData', formData)
    }
    const shopIdParam = formData?.shopId ? `&shop_id=${encodeURIComponent(formData?.shopId)}` : ''
    router.push(`/register?token=${encodeURIComponent(token)}&edit=true${shopIdParam}`)
  }

  const handleLogoClick = () => router.push('/')

  const handleModalClose = async () => {
    setShowSuccessModal(false)
    // モーダルを閉じた後、プラン登録画面に遷移（サーバーサイドセッションにメールアドレスを保存）
    await setRegisterSessionItem('userEmail', email)
    // window.location.hrefを使用して強制的に遷移
    if (typeof window !== 'undefined') {
      window.location.href = '/plan-registration?saitamaAppLinked=true'
    } else {
      router.push('/plan-registration?saitamaAppLinked=true')
    }
  }

  const handleSaitamaFailedModalClose = async () => {
    setShowSaitamaFailedModal(false)
    // さいたま市アプリ連携なしでプラン登録画面に遷移
    await setRegisterSessionItem('userEmail', email)
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
