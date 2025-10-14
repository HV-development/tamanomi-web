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
}

export function ProfileEditLayout({ user, onSubmit, onCancel, onWithdraw, onLogoClick, isLoading }: ProfileEditLayoutProps) {
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

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
