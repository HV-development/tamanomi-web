'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmailRegistrationLayout } from '@/components/templates/email-registration-layout'

export default function EmailRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'complete'>('form')
  const router = useRouter()

  // クライアントサイドの初期化
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEmailSubmit = async (email: string, campaignCode?: string) => {
    setIsLoading(true)
    try {
      // 直接新規登録画面に遷移（遅延なし）
      router.push(`/register?email=${encodeURIComponent(email)}&token=dummy-token`)
    } catch (error) {
      alert('ネットワークエラーが発生しました')
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
    />
  )
}