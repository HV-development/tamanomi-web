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
    if (!rank) {
      return "bg-gradient-to-br from-green-50 to-green-100" // 非会員・ブロンズ
    }
    
    switch (rank) {
      case "bronze":
        return "bg-gradient-to-br from-green-50 to-green-100"
      case "silver":
        return "bg-gradient-to-br from-rose-50 to-rose-100"
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-amber-100"
      case "diamond":
        return "bg-gradient-to-br from-sky-50 to-sky-100"
      default:
        return "bg-gradient-to-br from-green-50 to-green-100"
    }
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