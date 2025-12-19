"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { RegisterForm } from "./RegisterForm"
import { UserRegistrationComplete } from "@hv-development/schemas"

interface RegisterContainerProps {
  email?: string
  initialFormData?: UserRegistrationComplete | null
  onSubmit: (data: UserRegistrationComplete) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
  errorMessage?: string
}

export function RegisterContainer({
  email,
  initialFormData,
  onSubmit,
  onCancel,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
  errorMessage
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

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

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