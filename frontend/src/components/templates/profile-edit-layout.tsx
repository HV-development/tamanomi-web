"use client"

"use client"

import { ProfileEditContainer } from "../organisms/profile-edit-container"
import type { User } from "../../types/user"

interface ProfileEditFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
}

interface ProfileEditLayoutProps {
  user: User
  onSubmit: (data: ProfileEditFormData) => void
  onCancel: () => void
  onWithdraw: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function ProfileEditLayout({ user, onSubmit, onCancel, onWithdraw, onLogoClick, isLoading, currentUserRank }: ProfileEditLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return (
    <ProfileEditContainer
      user={user}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onWithdraw={onWithdraw}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
