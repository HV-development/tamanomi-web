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
  currentUserRank?: string | null
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
  currentUserRank,
}: EmailChangeLayoutProps) {
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
