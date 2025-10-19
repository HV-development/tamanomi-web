"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { PasswordResetForm } from "../molecules/password-reset-form"
import { PasswordResetComplete } from "../molecules/password-reset-complete"

interface PasswordResetContainerProps {
  currentStep: "form" | "complete"
  email?: string
  onSubmit: (email: string) => void
  onCancel: () => void
  onBackToLogin: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
}

export function PasswordResetContainer({
  currentStep,
  email = "",
  onSubmit,
  onCancel,
  onBackToLogin,
  onResend,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: PasswordResetContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={onLogoClick}
        showBackButton={true}
        onBackClick={currentStep === "form" ? onCancel : onBackToLogin}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {currentStep === "form" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">パスワード再設定</h2>
                  <p className="text-gray-600">有効なメールアドレスを入力してください</p>
                </div>
                <PasswordResetForm onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />
              </>
            ) : (
              <PasswordResetComplete email={email} onBackToLogin={onBackToLogin} onResend={onResend} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
