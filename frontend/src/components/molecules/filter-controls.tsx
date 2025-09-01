"use client"

import { useState, useRef, useEffect } from "react"
import { Logo } from "../atoms/logo"
import { HamburgerMenu } from "./hamburger-menu"
import { PopupButton } from "../atoms/popup-button"
import { Button } from "../atoms/button"
import { GenrePopup } from "./genre-popup"
import { AreaPopup } from "./area-popup"
import { Heart, LogIn, MoreVertical, LogOut } from "lucide-react"
import { User } from "lucide-react"
import { RankBadge } from "../atoms/rank-badge"
import { calculateUserRank } from "../../utils/rank-calculator"
import type { Notification } from "../../types/notification"
import type { User as UserType } from "../../types/user"

// ユーザーランク計算のヘルパー関数
function getUserRankValue(user?: UserType): string | null {
  if (!user) return null
  
  const contractDate = user.contractStartDate
  const createdDate = user.createdAt
  
  if (contractDate && contractDate instanceof Date) {
    return calculateUserRank(contractDate)
  } else if (createdDate && createdDate instanceof Date) {
    return calculateUserRank(createdDate)
  } else if (contractDate && typeof contractDate === 'string') {
    return calculateUserRank(new Date(contractDate))
  } else if (createdDate && typeof createdDate === 'string') {
    return calculateUserRank(new Date(createdDate))
  }
  return null
}

interface FilterControlsProps {
  selectedGenres: string[]
  selectedEvents: string[]
  selectedArea: string
  isFavoritesFilter: boolean
  notifications: Notification[]
  isAuthenticated: boolean
  user?: UserType
  onGenresChange: (genres: string[]) => void
  onEventsChange: (events: string[]) => void
  onAreaChange: (area: string) => void
  onCurrentLocationClick: () => void
  onFavoritesClick: () => void
  onMenuItemClick: (itemId: string) => void
  onLogoClick: () => void
  onTabChange: (tab: string) => void
  onLogout?: () => void
  favoriteCount?: number
}


export function FilterControls({
  selectedGenres,
  selectedEvents,
  selectedArea,
  isFavoritesFilter,
  notifications,
  isAuthenticated,
  user,
  onGenresChange,
  onEventsChange,
  onAreaChange,
  onCurrentLocationClick,
  onFavoritesClick,
  onMenuItemClick,
  onLogoClick,
  onTabChange,
  onLogout,
  favoriteCount = 0,
}: FilterControlsProps) {
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false)
  const [isAreaPopupOpen, setIsAreaPopupOpen] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // クライアントサイドでのみレンダリングするためのフラグ
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ユーザーメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])
  
  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre]
    onGenresChange(newGenres)
  }

  const handleEventToggle = (event: string) => {
    const newEvents = selectedEvents.includes(event)
      ? selectedEvents.filter((e) => e !== event)
      : [...selectedEvents, event]
    onEventsChange(newEvents)
  }

  const handleGenresClear = () => {
    onGenresChange([])
    onEventsChange([])
  }

  const handleGenrePopupOpen = () => {
    setIsGenrePopupOpen(true)
  }

  const handleGenrePopupClose = () => {
    setIsGenrePopupOpen(false)
  }

  const handleAreaSelect = (area: string) => {
    onAreaChange(area)
  }

  const handleAreaClear = () => {
    onAreaChange("")
  }

  const handleAreaPopupOpen = () => {
    setIsAreaPopupOpen(true)
  }

  const handleAreaPopupClose = () => {
    setIsAreaPopupOpen(false)
  }

  const handleCurrentLocationClick = () => {
    onCurrentLocationClick()
  }

  const handleNotificationClick = () => {
    setIsNotificationPanelOpen(true)
  }

  const handleNotificationClose = () => {
    setIsNotificationPanelOpen(false)
  }

  const handleNotificationItemClick = (notificationId: string) => {
    // 通知項目クリック処理は親コンポーネントに委譲
    console.log("通知項目クリック:", notificationId)
  }

  const handleMarkAllNotificationsRead = () => {
    // 全て既読処理は親コンポーネントに委譲
    console.log("すべての通知を既読にする")
  }

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    if (onLogout) {
      onLogout()
    }
  }

  // ユーザーのランクを計算
  const userRank = getUserRankValue(user)
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側: ハンバーガーメニューとランク */}
        <div className="flex items-center gap-3 w-20">
          <HamburgerMenu onMenuItemClick={onMenuItemClick} isAuthenticated={isAuthenticated} />
        </div>

        {/* 中央: ロゴ */}
        <div className="flex-1 flex justify-center">
          <Logo size="lg" onClick={onLogoClick} />
        </div>

        {/* 右側: ユーザーメニュー（ログイン時のみ） */}
        <div className="flex items-center justify-end w-20">
          {isClient && isAuthenticated ? (
            userRank && (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                <img
                  src={`/${userRank}.png`}
                  alt={`${userRank}ランク`}
                  className="w-5 h-5 object-contain"
                />
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* フィルターコントロール */}
      <div className="grid grid-cols-3 gap-1 px-2 py-4">
        <button
          onClick={handleCurrentLocationClick}
          className="w-full flex items-center justify-center gap-1 px-2 py-2 border border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
        >
          近くのお店
        </button>
        <button
          onClick={handleAreaPopupOpen}
          className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            selectedArea
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
          }`}
        >
          <span>エリア</span>
          {selectedArea && (
            <span className="bg-green-600 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center flex-shrink-0">
              1
            </span>
          )}
        </button>
        <button
          onClick={handleGenrePopupOpen}
          className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            selectedGenres.length > 0
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
          }`}
        >
          <span>ジャンル</span>
          {selectedGenres.length > 0 && (
            <span className="bg-green-600 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center flex-shrink-0">
              {selectedGenres.length}
            </span>
          )}
        </button>
      </div>

      {/* エリア選択ポップアップ */}
      <AreaPopup
        isOpen={isAreaPopupOpen}
        selectedArea={selectedArea}
        onAreaSelect={handleAreaSelect}
        onClose={handleAreaPopupClose}
        onClear={handleAreaClear}
      />

      {/* ジャンル選択ポップアップ */}
      <GenrePopup
        isOpen={isGenrePopupOpen}
        selectedGenres={selectedGenres}
        selectedEvents={selectedEvents}
        onGenreToggle={handleGenreToggle}
        onEventToggle={handleEventToggle}
        onClose={handleGenrePopupClose}
        onClear={handleGenresClear}
      />

    </div>
  )
}