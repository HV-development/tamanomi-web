"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { RegisterConfirmationDisplay } from "../molecules/register-confirmation-display"

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

interface RegisterConfirmationContainerProps {
  data: RegisterFormData
  email?: string
  onRegister: () => void
  onEdit: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
}

export function RegisterConfirmationContainer({
  data,
  email,
  onRegister,
  onEdit,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: RegisterConfirmationContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onEdit} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <RegisterConfirmationDisplay 
              data={data} 
              email={email}
              onRegister={onRegister} 
              onEdit={onEdit} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}