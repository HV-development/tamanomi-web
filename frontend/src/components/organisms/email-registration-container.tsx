"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { EmailRegistrationForm } from "../molecules/email-registration-form"
import { EmailRegistrationComplete } from "../molecules/email-registration-complete"

interface EmailRegistrationContainerProps {
  currentStep: "form" | "complete"
  email?: string
  onSubmit: (email: string, campaignCode?: string) => void
  onBack: () => void
  onBackToLogin: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
  errorMessage?: string
  successMessage?: string
}

export function EmailRegistrationContainer({
  currentStep,
  email = "",
  onSubmit,
  onBack,
  onBackToLogin,
  onResend,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
  errorMessage,
  successMessage,
}: EmailRegistrationContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={onLogoClick}
        showBackButton={true}
        onBackClick={currentStep === "form" ? onBack : onBackToLogin}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {currentStep === "form" ? (
              <EmailRegistrationForm
                initialEmail={email}
                onSubmit={onSubmit}
                onBack={onBack}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            ) : (
              <EmailRegistrationComplete
                email={email}
                onBackToLogin={onBackToLogin}
                onResend={onResend}
                isLoading={isLoading}
                errorMessage={errorMessage}
                successMessage={successMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
