"use client"

"use client"

import { Logo } from "../atoms/logo"
import { EmailConfirmationComplete } from "../molecules/email-confirmation-complete"

interface EmailConfirmationLayoutProps {
  email: string
  onLogoClick: () => void
}

export function EmailConfirmationLayout({
  email,
  onLogoClick,
}: EmailConfirmationLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー - 戻るボタンなし */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center">
          <Logo size="lg" onClick={onLogoClick} />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <EmailConfirmationComplete email={email} />
        </div>
      </div>
    </div>
  )
}