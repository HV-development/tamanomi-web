"use client"

import { X, Bell, CheckCheck } from "lucide-react"
import { NotificationItem } from "../atoms/notification-item"
import type { Notification } from "../../types/notification"

interface NotificationPanelProps {
  isOpen: boolean
  notifications: Notification[]
  onClose: () => void
  onNotificationClick: (notificationId: string) => void
  onMarkAllRead: () => void
  className?: string
}

export function NotificationPanel({
  isOpen,
  notifications,
  onClose,
  onNotificationClick,
  onMarkAllRead,
  className = "",
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose}></div>}

      {/* スライドパネル */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${className}`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">お知らせ</h2>
                  <p className="text-green-100 text-sm">{unreadCount > 0 ? `${unreadCount}件の未読` : "すべて既読"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 全て既読ボタン */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                すべて既読にする
              </button>
            )}
          </div>

          {/* 通知リスト */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-500 font-medium">お知らせはありません</div>
                <div className="text-gray-400 text-sm mt-1">新しいお知らせが届くとここに表示されます</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
