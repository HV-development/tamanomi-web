"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { ConfirmationDisplay } from "../molecules/confirmation-display"

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

interface ConfirmationContainerProps {
  data: SignupFormData
  onRegister: () => void
  onEdit: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function ConfirmationContainer({
  data,
  onRegister,
  onEdit,
  onLogoClick,
  isLoading,
}: ConfirmationContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onEdit} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ConfirmationDisplay data={data} onRegister={onRegister} onEdit={onEdit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
