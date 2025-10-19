"use client"

import { Home, Heart, User, LogIn } from "lucide-react"
import { useAppContext } from "../../contexts/AppContext"

interface FooterNavigationProps {
  className?: string
}

export function FooterNavigation({
  className = "",
}: FooterNavigationProps) {
  // Context から必要な値を取得
  const { navigation, auth, handlers } = useAppContext()

  const activeTab = navigation.activeTab
  const isAuthenticated = auth.isAuthenticated
  const onTabChange = handlers.handleTabChange
  const onFavoritesClick = handlers.handleFavoritesClick
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
    <div className={`bg-green-600 px-4 py-2 sticky bottom-0 z-30 ${className}`}>
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 min-w-0 flex-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}
            >
              <Icon className="w-5 h-5 text-white" />
              <span className="text-xs font-medium text-white">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}