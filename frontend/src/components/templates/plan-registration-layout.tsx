"use client"

import { PlanRegistrationContainer } from "../organisms/plan-registration-container"
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationLayoutProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
  plans: PlanListResponse['plans']
  error?: string
}

export function PlanRegistrationLayout({ 
  onPaymentMethodRegister, 
  onCancel, 
  onLogoClick, 
  isLoading, 
  currentUserRank,
  plans,
  error
}: PlanRegistrationLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <PlanRegistrationContainer
      onPaymentMethodRegister={onPaymentMethodRegister}
      onCancel={onCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
      plans={plans}
      error={error}
    />
  )
}