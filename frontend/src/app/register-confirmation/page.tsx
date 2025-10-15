'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterConfirmationLayout } from '@/components/templates/register-confirmation-layout'
import { UserRegistrationComplete } from "@hv-development/schemas"
import { Modal } from '@/components/atoms/modal'
import { Button } from '@/components/atoms/button'

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

      // フォームデータを取得（通常はlocalStorageやsessionStorageから）
      const storedData = sessionStorage.getItem('registerFormData')
      console.log('🔍 [register-confirmation] SessionStorage raw data:', storedData)

      if (!storedData || !tokenParam) {
        // データがない場合は登録画面にリダイレクト
        router.push('/email-registration')
        return
      }

      try {
        const parsedData = JSON.parse(storedData) as UserRegistrationComplete
        console.log('🔍 [register-confirmation] Parsed session data:', {
          nickname: parsedData.nickname,
          saitamaAppId: parsedData.saitamaAppId,
          saitamaAppIdType: typeof parsedData.saitamaAppId,
          saitamaAppIdLength: parsedData.saitamaAppId?.length,
          saitamaAppIdValue: `"${parsedData.saitamaAppId}"`,
        })
        setFormData(parsedData)
        setEmail(emailParam)
        setToken(tokenParam)
      } catch (error) {
        console.error('Failed to parse form data:', error)
        router.push('/email-registration')
      }
    }
  }, [router])

  const handleRegister = async () => {
    if (!formData || !token) return

    setIsLoading(true)

    try {
      const saitamaAppIdValue = formData.saitamaAppId && formData.saitamaAppId.trim() !== '' ? formData.saitamaAppId.trim() : undefined;
      
      console.log('🔍 [register-confirmation] Form data:', {
        email: email,
        nickname: formData.nickname,
        saitamaAppId: formData.saitamaAppId,
        saitamaAppIdTrimmed: saitamaAppIdValue,
        saitamaAppIdWillSend: saitamaAppIdValue !== undefined,
      })

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
          // 空文字列の場合はundefinedとして送信しない
          saitamaAppId: saitamaAppIdValue,
          token: token,
        }),
      })

      const result = await response.json()

      // デバッグログ
      console.log('🔍 [register-confirmation] Register response:', {
        status: response.status,
        ok: response.ok,
        hasPointsGranted: 'pointsGranted' in result,
        pointsGranted: result.pointsGranted,
        pointsGrantedType: typeof result.pointsGranted,
        resultKeys: Object.keys(result),
        result: result
      })

      if (response.ok) {
        // トークンをlocalStorageに保存
        if (result.accessToken) {
          localStorage.setItem('accessToken', result.accessToken)
          console.log('✅ [register-confirmation] Access token saved to localStorage')
        }
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken)
          console.log('✅ [register-confirmation] Refresh token saved to localStorage')
        }

        // 登録成功後はセッションストレージをクリア
        sessionStorage.removeItem('registerFormData')

        // さいたま市アプリ連携でポイント付与があった場合はモーダルを表示
        console.log('🔍 [register-confirmation] Checking pointsGranted:', {
          pointsGranted: result.pointsGranted,
          willShowModal: !!result.pointsGranted,
        });
        if (result.pointsGranted) {
          setPointsGranted(result.pointsGranted)
          setShowSuccessModal(true)
        } else {
          // ポイント付与がない場合は直接プラン登録画面に遷移
          router.push('/plan-registration?email=' + encodeURIComponent(email))
        }
      } else {
        // エラーハンドリング
        const errorMessage = result.message || result.error?.message || '登録に失敗しました'

        // 409エラー（既存アカウント）の場合は特別な処理
        if (response.status === 409 && result.errorCode === 'USER_ALREADY_EXISTS') {
          // ログイン画面にリダイレクト
          router.push(`/?error=already_registered&email=${encodeURIComponent(email)}`)
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
    router.push(`/register?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&edit=true`)
  }

  const handleLogoClick = () => router.push('/')

  const handleModalClose = () => {
    setShowSuccessModal(false)
    // モーダルを閉じた後、プラン登録画面に遷移
    router.push('/plan-registration?email=' + encodeURIComponent(email))
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
      <RegisterConfirmationLayout
        data={formData}
        email={email}
        onRegister={handleRegister}
        onEdit={handleEdit}
        onLogoClick={handleLogoClick}
        isLoading={isLoading}
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