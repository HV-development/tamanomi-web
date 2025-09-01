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
    // パスワード変更処理を実行してからログイン画面に遷移
    onSubmit(currentPassword, newPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex flex-col">
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