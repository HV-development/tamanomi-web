"use client"

import { RegisterConfirmationContainer } from "../organisms/register-confirmation-container"

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

interface RegisterConfirmationLayoutProps {
  data: RegisterFormData
  email?: string
  onRegister: () => void
  onEdit: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function RegisterConfirmationLayout({ 
  data, 
  email, 
  onRegister, 
  onEdit, 
  onLogoClick, 
  isLoading, 
  currentUserRank 
}: RegisterConfirmationLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <RegisterConfirmationContainer
      data={data}
      email={email}
      onRegister={onRegister}
      onEdit={onEdit}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}