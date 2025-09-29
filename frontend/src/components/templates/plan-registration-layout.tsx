"use client"

import { PlanRegistrationContainer } from "../organisms/plan-registration-container"

interface PlanRegistrationLayoutProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function PlanRegistrationLayout({ 
  onPaymentMethodRegister, 
  onCancel, 
  onLogoClick, 
  isLoading, 
  currentUserRank 
}: PlanRegistrationLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return (
    <PlanRegistrationContainer
      onPaymentMethodRegister={onPaymentMethodRegister}
      onCancel={onCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}