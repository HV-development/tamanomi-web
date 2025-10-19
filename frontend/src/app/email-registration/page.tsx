'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { EmailRegistrationLayout } from '@/components/templates/email-registration-layout'
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

  const handleBack = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // EmailRegistrationLayoutの型に合わせるためのラッパー関数
  const handleSubmit = (data: { email: string; campaignCode: string; }) => {
    handleEmailSubmit(data)
  }

  return (
    <EmailRegistrationLayout
      currentStep={currentStep}
      email={email}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onBackToLogin={handleBack}
      onResend={handleResend}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
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