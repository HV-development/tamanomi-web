"use client"

import { Logo } from "../atoms/Logo"
import { HamburgerMenu } from "../molecules/HamburgerMenu"

interface HomeHeaderProps {
  onMenuItemClick: (itemId: string) => void
  isAuthenticated: boolean
  onLogoClick: () => void
}

/**
 * ホーム画面のヘッダー（3点リーダー・ロゴ）。
 * 押しつぶされないよう flex-shrink-0 と min-h を指定。
 */
export function HomeHeader({
  onMenuItemClick,
  isAuthenticated,
  onLogoClick,
}: HomeHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 min-h-[5.5rem]">
        <div className="flex items-center gap-3 w-20">
          <HamburgerMenu onMenuItemClick={onMenuItemClick} isAuthenticated={isAuthenticated} />
        </div>
        <div className="flex-1 flex justify-center">
          <Logo size="lg" onClick={onLogoClick} />
        </div>
        <div className="flex items-center justify-end w-20">
          {/* 右側: ユーザーメニュー等（将来のランク表示など） */}
        </div>
      </div>
    </div>
  )
}
