"use client"

import { SubscriptionContainer } from "../organisms/subscription-container"

interface SubscriptionLayoutProps {
  onSubscribe: (planId: string) => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function SubscriptionLayout({ onSubscribe, onLogoClick, isLoading, currentUserRank }: SubscriptionLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    if (!rank) {
      return "bg-gradient-to-br from-green-50 to-green-100" // 非会員・ブロンズ
    }
    
    switch (rank) {
      case "bronze":
        return "bg-gradient-to-br from-green-50 to-green-100"
      case "silver":
        return "bg-gradient-to-br from-rose-50 to-rose-100"
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-amber-100"
      case "diamond":
        return "bg-gradient-to-br from-sky-50 to-sky-100"
      default:
        return "bg-gradient-to-br from-green-50 to-green-100"
    }
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return <SubscriptionContainer onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} backgroundColorClass={backgroundColorClass} />
}
