"use client"

import { useState } from "react"
import { NotificationIcon } from "../atoms/notification-icon"
import { HamburgerIcon } from "../atoms/hamburger-icon"
import { MenuDropdown } from "./menu-dropdown"

interface HeaderMenuProps {
  hasNotification?: boolean
  onNotificationClick: () => void
  onMenuItemClick: (itemId: string) => void
  className?: string
}

export function HeaderMenu({
  hasNotification = false,
  onNotificationClick,
  onMenuItemClick,
  className = "",
}: HeaderMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
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
  ]

  return (
    <div className={`flex items-center gap-2 relative ${className}`}>
      <NotificationIcon hasNotification={hasNotification} onClick={onNotificationClick} />
      <HamburgerIcon isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
      <MenuDropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} items={menuItems} />
    </div>
  )
}
