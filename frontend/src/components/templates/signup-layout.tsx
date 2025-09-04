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
