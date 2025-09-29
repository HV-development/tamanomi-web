"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { RegisterForm } from "../molecules/register-form"

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

interface RegisterContainerProps {
  email?: string
  initialFormData?: RegisterFormData | null
  onSubmit: (data: RegisterFormData) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
}

export function RegisterContainer({ 
  email, 
  initialFormData,
  onSubmit, 
  onCancel, 
  onLogoClick, 
  isLoading, 
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100" 
}: RegisterContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onCancel} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">新規登録</h2>
              <p className="text-gray-600">必要事項を入力してください</p>
            </div>

            <RegisterForm
              email={email}
              initialFormData={initialFormData}
              onSubmit={onSubmit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}