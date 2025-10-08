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
  currentUserRank?: string | null
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
  currentUserRank,
}: PasswordResetLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

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
