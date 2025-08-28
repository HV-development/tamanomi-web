"use client"

import { Home, Heart, User, LogIn } from "lucide-react"

interface FooterNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isAuthenticated: boolean
  onFavoritesClick: () => void
  className?: string
}

export function FooterNavigation({
  activeTab,
  onTabChange,
  isAuthenticated,
  onFavoritesClick,
  className = "",
}: FooterNavigationProps) {
  const handleTabClick = (tab: string) => {
    if (tab === "favorites") {
      onFavoritesClick()
    } else {
      onTabChange(tab)
    }
  }

  const tabs = [
    { 
      id: "home", 
      label: "ホーム", 
      icon: Home,
    },
    { 
      id: "favorites", 
      label: "お気に入り", 
      icon: Heart,
    },
    {
      id: "mypage",
      label: isAuthenticated ? "マイページ" : "ログイン",
      icon: isAuthenticated ? User : LogIn,
    },
  ]

  return (
    <div className={`bg-green-600 px-4 py-3 sticky bottom-0 z-30 ${className}`}>
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center gap-1 py-1 min-w-0 flex-1"
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-green-200"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-white" : "text-green-200"}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}