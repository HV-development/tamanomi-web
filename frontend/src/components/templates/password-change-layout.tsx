"use client"

import { PasswordChangeContainer } from "../organisms/password-change-container"

interface PasswordChangeLayoutProps {
  currentStep: "form" | "complete"
  onSubmit: (currentPassword: string, newPassword: string) => void
  onCancel: () => void
  onBackToLogin: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function PasswordChangeLayout({
  currentStep,
  onSubmit,
  onCancel,
  onBackToLogin,
  onLogoClick,
  isLoading,
}: PasswordChangeLayoutProps) {
  return (
    <PasswordChangeContainer
      currentStep={currentStep}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onBackToLogin={onBackToLogin}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
    />
  )
}