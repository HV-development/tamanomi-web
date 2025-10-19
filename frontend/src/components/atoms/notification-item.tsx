"use client"

import Image from "next/image"
import { Bell, AlertTriangle, CheckCircle, Gift, Info } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Notification } from "../../types/notification"

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  className?: string
}

export function NotificationItem({ notification, onClick, className = "" }: NotificationItemProps) {
  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "promotion":
        return <Gift className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "border-blue-200 bg-blue-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "promotion":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "たった今"
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return format(date, "M月d日", { locale: ja })
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
        notification.isRead ? "bg-white border-gray-200" : `${getTypeColor(notification.type)} border-2`
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`text-sm font-bold ${notification.isRead ? "text-gray-700" : "text-gray-900"} line-clamp-2`}>
              {notification.title}
            </h3>
            {!notification.isRead && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1 ml-2"></div>}
          </div>

          <p
            className={`text-xs ${
              notification.isRead ? "text-gray-500" : "text-gray-700"
            } line-clamp-3 mb-2 leading-relaxed`}
          >
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{formatDate(notification.createdAt)}</span>
            {notification.imageUrl && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={notification.imageUrl || "/placeholder.svg"}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
