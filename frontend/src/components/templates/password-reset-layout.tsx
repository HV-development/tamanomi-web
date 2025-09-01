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
    />
  )
}
