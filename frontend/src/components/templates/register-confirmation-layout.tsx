"use client"

import { RegisterConfirmationContainer } from "../organisms/register-confirmation-container"
import { UserRegistrationComplete } from "@hv-development/schemas"

interface RegisterConfirmationLayoutProps {
  data: UserRegistrationComplete
  email?: string
  onRegister: () => void
  onEdit: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function RegisterConfirmationLayout({
  data,
  email,
  onRegister,
  onEdit,
  onLogoClick,
  isLoading,
}: RegisterConfirmationLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

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