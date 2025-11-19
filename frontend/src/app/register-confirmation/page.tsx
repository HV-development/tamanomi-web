'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterConfirmationContainer } from '@/components/organisms/RegisterConfirmationContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'

export default function RegisterConfirmationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UserRegistrationComplete | null>(null)
  const [email, setEmail] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [pointsGranted, setPointsGranted] = useState<number | null>(null)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email') || ''
      const tokenParam = urlParams.get('token') || ''

      // トークンがない場合は登録画面にリダイレクト
      if (!tokenParam) {
        router.push('/email-registration')
        return
      }

      // まずsessionStorageから取得を試みる
      const storedData = sessionStorage.getItem('registerFormData')

      if (storedData) {
        // sessionStorageにデータがある場合（通常フロー）
        try {
          const parsedData = JSON.parse(storedData) as UserRegistrationComplete
          setFormData(parsedData)
          setEmail(emailParam)
          setToken(tokenParam)
          return
        } catch (error) {
          console.error('sessionStorage parse error:', error)
          // パースエラーの場合は次の処理へ
        }
      }

      // sessionStorageがない場合、トークンからemailを復元
      try {
        console.log('🔄 sessionStorageが空のため、トークンからemailを復元します')
        
        // Base64URLデコード（ブラウザ環境用）
        const paddedToken = tokenParam + '='.repeat((4 - tokenParam.length % 4) % 4)
        const base64 = paddedToken.replace(/-/g, '+').replace(/_/g, '/')
        
        // ブラウザ環境でのデコード
        const decodedString = atob(base64)
        const tokenData = JSON.parse(decodedString)
        
        console.log('✅ トークンからemailを復元:', tokenData.email)
        
        // 有効期限チェック
        if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
          alert('トークンの有効期限が切れています。再度メール登録からやり直してください。')
          router.push('/email-registration')
          return
        }
        
        // tokenDataから取得したemailまたはURLパラメータのemailを使用
        const recoveredEmail = tokenData.email || emailParam
        
        if (!recoveredEmail) {
          throw new Error('メールアドレスを取得できませんでした')
        }
        
        // ユーザーに情報を再入力してもらうため、登録画面に戻す
        alert('セッションが切れました。お手数ですが、再度情報を入力してください。')
        router.push(`/register?email=${encodeURIComponent(recoveredEmail)}&token=${encodeURIComponent(tokenParam)}`)
        
      } catch (error) {
        console.error('トークンデコードエラー:', error)
        alert('トークンの検証に失敗しました。再度メール登録からやり直してください。')
        router.push('/email-registration')
      }
    }
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
      
      console.log('🔍 [register-confirmation] referrerUserId from sessionStorage:', referrerUserId);

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
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Cookieベースの認証のみを使用（localStorageは廃止）
        // トークンはサーバー側でCookieに設定されるため、フロントエンドでの保存は不要

        // 登録成功後はセッションストレージをクリア
        sessionStorage.removeItem('registerFormData')
        sessionStorage.removeItem('referrerUserId')

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
    // フォームデータをsessionStorageに保存してから登録画面に戻る
    if (formData) {
      sessionStorage.setItem('editFormData', JSON.stringify(formData))
    }
    router.push(`/register?token=${encodeURIComponent(token)}&edit=true`)
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
  if (!isClient || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
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