"use client"

"use client"

import { PasswordResetContainer } from "../organisms/password-reset-container"

interface PasswordResetLayoutProps {
  currentStep: "form" | "complete"
  email?: string
  onSubmit: (email: string) => void
  onCancel: () => void
  onBackToLogin: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function PasswordResetLayout({
  currentStep,
  email,
  onSubmit,
  onCancel,
  onBackToLogin,
  onResend,
  onLogoClick,
  isLoading,
}: PasswordResetLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <PasswordResetContainer
      currentStep={currentStep}
      email={email}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onBackToLogin={onBackToLogin}
      onResend={onResend}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
