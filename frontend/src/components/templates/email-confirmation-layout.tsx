"use client"

"use client"

import { Logo } from "../atoms/logo"
import { EmailConfirmationComplete } from "../molecules/email-confirmation-complete"

interface EmailConfirmationLayoutProps {
  email: string
  onLogoClick: () => void
  currentUserRank?: string | null
}

export function EmailConfirmationLayout({
  email,
  onLogoClick,
  currentUserRank,
}: EmailConfirmationLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    if (!rank) {
      return "bg-gradient-to-br from-green-50 to-green-100" // 非会員・ブロンズ
    }
    
    switch (rank) {
      case "bronze":
        return "bg-gradient-to-br from-green-50 to-green-100"
      case "silver":
        return "bg-gradient-to-br from-rose-50 to-rose-100"
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-amber-100"
      case "diamond":
        return "bg-gradient-to-br from-sky-50 to-sky-100"
      default:
        return "bg-gradient-to-br from-green-50 to-green-100"
    }
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

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