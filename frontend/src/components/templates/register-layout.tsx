"use client"

import { RegisterContainer } from "../organisms/register-container"
import { UserRegistrationComplete } from "@hv-development/schemas"

interface RegisterLayoutProps {
  email?: string
  initialFormData?: UserRegistrationComplete | null
  onSubmit: (data: UserRegistrationComplete) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function RegisterLayout({
  email,
  initialFormData,
  onSubmit,
  onCancel,
  onLogoClick,
  isLoading,
  currentUserRank
}: RegisterLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <RegisterContainer
      email={email}
      initialFormData={initialFormData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}