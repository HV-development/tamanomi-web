"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { SignupForm } from "../molecules/signup-form"

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

interface SignupContainerProps {
  initialData?: Partial<SignupFormData>
  email?: string
  onSubmit: (data: SignupFormData) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function SignupContainer({ initialData, email, onSubmit, onCancel, onLogoClick, isLoading }: SignupContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
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

            <SignupForm
              initialData={initialData}
              email={email}
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