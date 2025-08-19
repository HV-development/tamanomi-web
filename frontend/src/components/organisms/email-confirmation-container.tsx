"use client"

import { Logo } from "../atoms/logo"
import { EmailConfirmationComplete } from "../molecules/email-confirmation-complete"

interface EmailConfirmationContainerProps {
  email: string
  onBackToLogin: () => void
  onLogoClick: () => void
}

export function EmailConfirmationContainer({
  email,
  onBackToLogin,
  onLogoClick,
}: EmailConfirmationContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center">
          <Logo size="sm" onClick={onLogoClick} />
        </div>
        <div className="w-full max-w-md">
          <EmailConfirmationComplete
            email={email}
            onBackToLogin={onBackToLogin}
          />
        </div>
      </div>
    </div>
  )
}