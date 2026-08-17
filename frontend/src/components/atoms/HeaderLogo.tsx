"use client"

import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/atoms/Logo"

interface HeaderLogoProps {
  onLogoClick: () => void
  showBackButton?: boolean
  onBackClick?: () => void
  showHomeButton?: boolean
  onHomeClick?: () => void
  homeButtonPosition?: "left" | "right"
  title?: string
  className?: string
  logoSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
}

export function HeaderLogo({
  onLogoClick,
  showBackButton = false,
  onBackClick,
  showHomeButton = false,
  onHomeClick,
  homeButtonPosition = "right",
  title,
  className = "",
  logoSize = "lg",
}: HeaderLogoProps) {
  const showLeftHomeButton = showHomeButton && !!onHomeClick && homeButtonPosition === "left"
  const showRightHomeButton = showHomeButton && !!onHomeClick && homeButtonPosition === "right"

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* 左側の戻るボタン */}
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="absolute left-0 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
        )}

        {/* 左側のhomeボタン */}
        {showLeftHomeButton && (
          <button
            onClick={onHomeClick}
            className="absolute left-0 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Homeへ
          </button>
        )}

        {/* 中央のロゴ */}
        <Logo size={logoSize} onClick={onLogoClick} />

        {/* 右側のhomeボタンまたはタイトル */}
        {showRightHomeButton ? (
          <button
            onClick={onHomeClick}
            className="absolute right-0 text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
          >
            Home
          </button>
        ) : title ? (
          <h1 className="absolute right-0 text-lg font-bold text-gray-900">{title}</h1>
        ) : null}
      </div>
    </div>
  )
}