"use client"

import { Logo } from "@/components/atoms/Logo"

interface HeaderLogoProps {
  onLogoClick: () => void
  showBackButton?: boolean
  onBackClick?: () => void
  showHomeButton?: boolean
  onHomeClick?: () => void
  title?: string
  className?: string
}

export function HeaderLogo({
  onLogoClick,
  showBackButton = false,
  onBackClick,
  showHomeButton = false,
  onHomeClick,
  title,
  className = "",
}: HeaderLogoProps) {
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* 左側の戻るボタン */}
        {showBackButton && onBackClick && (
          <button 
            onClick={onBackClick} 
            className="absolute left-0 text-green-600 hover:text-green-700 transition-colors"
          >
            ← 戻る
          </button>
        )}
        
        {/* 中央のロゴ */}
        <Logo size="lg" onClick={onLogoClick} />
        
        {/* 右側のhomeボタンまたはタイトル */}
        {showHomeButton && onHomeClick ? (
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