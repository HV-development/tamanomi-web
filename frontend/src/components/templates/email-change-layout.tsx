"use client"

import { EmailChangeContainer } from "../organisms/email-change-container"

interface EmailChangeLayoutProps {
  currentStep: "form" | "complete"
  currentEmail: string
  newEmail?: string
  initialNewEmail?: string
  onSubmit: (currentPassword: string, newEmail: string) => void
  onCancel: () => void
  onBackToMyPage: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function EmailChangeLayout({
  currentStep,
  currentEmail,
  newEmail,
  initialNewEmail,
  onSubmit,
  onCancel,
  onBackToMyPage,
  onResend = () => {},
  onLogoClick,
  isLoading,
}: EmailChangeLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <EmailChangeContainer
      currentStep={currentStep}
      currentEmail={currentEmail}
      newEmail={newEmail}
      initialNewEmail={initialNewEmail}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onBackToMyPage={onBackToMyPage}
      onResend={onResend}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
