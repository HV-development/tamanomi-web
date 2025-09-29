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
  currentUserRank?: string | null
}

export function PasswordChangeLayout({
  currentStep,
  onSubmit,
  onCancel,
  onBackToLogin,
  onLogoClick,
  isLoading,
  currentUserRank,
}: PasswordChangeLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return (
    <PasswordChangeContainer
      currentStep={currentStep}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onBackToLogin={onBackToLogin}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}