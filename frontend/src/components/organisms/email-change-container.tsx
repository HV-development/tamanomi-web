"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { EmailChangeForm } from "../molecules/email-change-form"
import { EmailChangeComplete } from "../molecules/email-change-complete"

interface EmailChangeContainerProps {
  currentStep: "form" | "complete"
  currentEmail: string
  newEmail?: string
  initialNewEmail?: string
  onSubmit: (currentPassword: string, newEmail: string) => void
  onCancel: () => void
  onBackToMyPage: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function EmailChangeContainer({
  currentStep,
  currentEmail,
  newEmail = "",
  initialNewEmail = "",
  onSubmit,
  onCancel,
  onBackToMyPage,
  onResend = () => {},
  onLogoClick,
  isLoading,
}: EmailChangeContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={onLogoClick}
        showBackButton={true}
        onBackClick={currentStep === "form" ? onCancel : onBackToMyPage}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {currentStep === "form" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">メールアドレス変更</h2>
                  <p className="text-gray-600">新しいメールアドレスを設定してください</p>
                </div>
                <EmailChangeForm
                  currentEmail={currentEmail}
                  initialNewEmail={initialNewEmail}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <EmailChangeComplete
                currentEmail={currentEmail}
                newEmail={newEmail}
                onBackToMyPage={onBackToMyPage}
                onResend={onResend}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
