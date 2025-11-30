'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmailRegistrationContainer } from '@/components/organisms/EmailRegistrationContainer'
import { useEmailRegistration } from '@/hooks/useEmailRegistration'

function EmailRegistrationContent() {
  const router = useRouter()
  const {
    currentStep,
    isLoading,
    errorMessage,
    successMessage,
    email,
    handleEmailSubmit,
    handleResend,
  } = useEmailRegistration()

  // URLパラメータから紹介者IDを取得してセッションストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get('ref')
      if (ref) {
        sessionStorage.setItem('referrerUserId', ref)
        // 保存後に確認
        const saved = sessionStorage.getItem('referrerUserId')
      } else {
        // 既存の値を確認
        const existing = sessionStorage.getItem('referrerUserId')
      }
    }
  }, [])

  const handleBack = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // EmailRegistrationLayoutの型に合わせるためのラッパー関数
  const handleSubmit = (data: { email: string; campaignCode: string; }) => {
    handleEmailSubmit(data)
  }

  return (
    <EmailRegistrationContainer
      currentStep={currentStep}
      email={email}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onBackToLogin={handleBack}
      onResend={handleResend}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
      backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  )
}

export default function EmailRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <EmailRegistrationContent />
    </Suspense>
  )
}