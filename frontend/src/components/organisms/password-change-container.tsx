"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { PasswordChangeForm } from "../molecules/password-change-form"
import { PasswordChangeComplete } from "../molecules/password-change-complete"

interface PasswordChangeContainerProps {
  currentStep: "form" | "complete"
  onSubmit: (currentPassword: string, newPassword: string) => void
  onCancel: () => void
  onLogoClick: () => void
  onBackToLogin: () => void
  isLoading?: boolean
}

export function PasswordChangeContainer({
  currentStep,
  onSubmit,
  onCancel,
  onLogoClick,
  onBackToLogin,
  isLoading,
}: PasswordChangeContainerProps) {
  const handleSubmit = (currentPassword: string, newPassword: string) => {
    console.log("🔍 PasswordChangeContainer handleSubmit START")
    console.log("🔍 Received passwords for change")
    console.log("🔍 Calling onSubmit prop")
    // パスワード変更処理を実行してからログイン画面に遷移
    onSubmit(currentPassword, newPassword)
    console.log("🔍 onSubmit prop called successfully")
    console.log("🔍 PasswordChangeContainer handleSubmit END")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">パスワード変更</h2>
                  <p className="text-gray-600">新しいパスワードを設定してください</p>
                </div>
                <PasswordChangeForm
                  onSubmit={handleSubmit}
                  onCancel={onCancel}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <PasswordChangeComplete onBackToLogin={onBackToLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}