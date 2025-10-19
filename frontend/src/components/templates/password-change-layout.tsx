"use client"

"use client"

import { PasswordChangeContainer } from "../organisms/password-change-container"

interface PasswordChangeLayoutProps {
  currentStep: "form" | "complete"
  onSubmit: (currentPassword: string, newPassword: string) => void
  onCancel: () => void
  onBackToLogin: () => void
  onLogoClick: () => void
  isLoading?: boolean
  errorMessage?: string | null
  currentUserRank?: string | null
}

export function PasswordChangeLayout({
  currentStep,
  onSubmit,
  onCancel,
  onBackToLogin,
  onLogoClick,
  isLoading,
  errorMessage,
  currentUserRank,
}: PasswordChangeLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <PasswordChangeContainer
      currentStep={currentStep}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onBackToLogin={onBackToLogin}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      errorMessage={errorMessage}
      backgroundColorClass={backgroundColorClass}
      currentUserRank={currentUserRank}
    />
  )
}