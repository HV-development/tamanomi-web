"use client"

import { Bell } from "lucide-react"

interface NotificationIconProps {
  hasNotification?: boolean
  onClick: () => void
  className?: string
}

export function NotificationIcon({ hasNotification = false, onClick, className = "" }: NotificationIconProps) {
  return (
    <button onClick={onClick} className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}>
      <Bell className="w-5 h-5 text-gray-600" />
      {hasNotification && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      )}
    </button>
  )
}
