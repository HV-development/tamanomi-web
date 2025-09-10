"use client"

"use client"

import { SignupContainer } from "../organisms/signup-container"

interface SignupFormData {
  nickname: string
  password: string
  passwordConfirm: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
}

interface SignupLayoutProps {
  initialData?: Partial<SignupFormData>
  onSubmit: (data: SignupFormData) => void
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

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

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
