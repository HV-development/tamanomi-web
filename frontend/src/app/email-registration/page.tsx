'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmailRegistrationLayout } from '@/components/templates/email-registration-layout'

export default function EmailRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'complete'>('form')
  const [errorMessage, setErrorMessage] = useState<string>('')


  const router = useRouter()

  // クライアントサイドの初期化
  useEffect(() => {
    setIsClient(true)

    // URLパラメータからエラーメッセージを取得
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')

      if (error) {
        switch (error) {
          case 'invalid_token':
            setErrorMessage('無効な確認リンクです。再度メール登録を行ってください。')
            break
          case 'token_expired':
            setErrorMessage('確認リンクの有効期限が切れています。再度メール登録を行ってください。')
            break
          case 'verification_failed':
            setErrorMessage('確認処理に失敗しました。再度メール登録を行ってください。')
            break
          default:
            setErrorMessage('エラーが発生しました。再度メール登録を行ってください。')
        }
      }
    }
  }, [])

  const handleEmailSubmit = async (email: string, campaignCode?: string) => {
    setIsLoading(true)
    setErrorMessage('') // エラーメッセージをクリア
    try {
      // 開発環境用の固定値
      const isDevelopment = process.env.NODE_ENV === 'development'

      if (isDevelopment) {
        // 開発環境では固定値を生成
        const mockRegistrationId = 'dev-reg-' + Date.now()
        const mockToken = Buffer.from(JSON.stringify({
          email,
          registrationId: mockRegistrationId,
          expiresAt: Date.now() + 30 * 60 * 1000,
          purpose: 'registration'
        })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        const mockVerificationUrl = `${window.location.origin}/api/auth/register/verify/${mockToken}`
        const mockOtp = '123456'
        const mockRequestId = 'dev-otp-' + Date.now()

        // 送信完了画面に遷移
        setCurrentStep('complete')
        return
      }

      // 本番環境では実際のAPIを呼び出し
      const response = await fetch('/api/v1/auth/pre-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '認証メールの送信に失敗しました')
      }

      const data = await response.json()

      // 送信完了画面に遷移
      setCurrentStep('complete')
    } catch (error) {
      alert(error instanceof Error ? error.message : '認証メールの送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient) {
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
    <EmailRegistrationLayout
      currentStep={currentStep}
      onSubmit={handleEmailSubmit}
      onBack={handleBack}
      onBackToLogin={handleBack}
      onResend={() => setCurrentStep('form')}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  )
}