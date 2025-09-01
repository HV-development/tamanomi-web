"use client"

import { useState } from "react"
import { Menu, X, ChevronRight } from "lucide-react"

interface MenuItem {
  id: string
  label: string
  onClick: () => void
}

interface HamburgerMenuProps {
  onMenuItemClick: (itemId: string) => void
  isAuthenticated?: boolean
  className?: string
}

export function HamburgerMenu({ onMenuItemClick, isAuthenticated = false, className = "" }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems: MenuItem[] = [
    {
      id: "terms",
      label: "利用規約",
      onClick: () => onMenuItemClick("terms"),
    },
    {
      id: "privacy",
      label: "プライバシーポリシー",
      onClick: () => onMenuItemClick("privacy"),
    },
    {
      id: "commercial-law",
      label: "特定商取引法について",
      onClick: () => onMenuItemClick("commercial-law"),
    },
    {
      id: "contact",
      label: "お問い合わせ",
      onClick: () => onMenuItemClick("contact"),
    },
    ...(isAuthenticated ? [{
      id: "logout",
      label: "ログアウト",
      onClick: () => onMenuItemClick("logout"),
    }] : []),
  ]

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleItemClick = (item: MenuItem) => {
    item.onClick()
    setIsOpen(false) // メニューを閉じる
  }

  const handleOverlayClick = () => {
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* ハンバーガーボタン */}
      <button
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="メニューを開く"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-green-600" />
        ) : (
          <Menu className="w-5 h-5 text-green-600" />
        )}
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={handleOverlayClick}
        ></div>
      )}

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {menuItems.map((item, index) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}