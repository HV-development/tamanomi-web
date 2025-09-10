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
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return <SubscriptionContainer onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} backgroundColorClass={backgroundColorClass} />
}
