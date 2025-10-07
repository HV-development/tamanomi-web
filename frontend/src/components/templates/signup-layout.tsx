"use client"

import { SignupContainer } from "../organisms/signup-container"
import { type UserRegistrationComplete } from "@tamanomi/schemas"

interface SignupLayoutProps {
  initialData?: Partial<UserRegistrationComplete>
  email?: string
  onSubmit: (data: UserRegistrationComplete) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function SignupLayout({ initialData, email, onSubmit, onCancel, onLogoClick, isLoading, currentUserRank }: SignupLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <SignupContainer
      initialData={initialData}
      email={email}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
