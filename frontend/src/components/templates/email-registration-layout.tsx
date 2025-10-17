"use client"


import { EmailRegistrationContainer } from "../organisms/email-registration-container"

interface EmailRegistrationLayoutProps {
  currentStep: "form" | "complete"
  email?: string
  onSubmit: (data: { email: string; campaignCode: string; }) => void
  onBack: () => void
  onBackToLogin: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
  errorMessage?: string
  successMessage?: string
}

export function EmailRegistrationLayout({
  currentStep,
  email,
  onSubmit,
  onBack,
  onBackToLogin,
  onResend,
  onLogoClick,
  isLoading,
  errorMessage,
  successMessage,
}: EmailRegistrationLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <EmailRegistrationContainer
      currentStep={currentStep}
      email={email}
      onSubmit={onSubmit}
      onBack={onBack}
      onBackToLogin={onBackToLogin}
      onResend={onResend}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  )
}
