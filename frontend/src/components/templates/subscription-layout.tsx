"use client"

import { SubscriptionContainer } from "../organisms/subscription-container"

interface SubscriptionLayoutProps {
  onSubscribe: (planId: string) => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function SubscriptionLayout({ onSubscribe, onLogoClick, isLoading }: SubscriptionLayoutProps) {
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return <SubscriptionContainer onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} backgroundColorClass={backgroundColorClass} />
}
