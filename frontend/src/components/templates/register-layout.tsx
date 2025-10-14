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
}

export function RegisterLayout({
  email,
  initialFormData,
  onSubmit,
  onCancel,
  onLogoClick,
  isLoading,
}: RegisterLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

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