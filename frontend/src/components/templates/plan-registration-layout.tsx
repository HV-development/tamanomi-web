"use client"

import { PlanRegistrationContainer } from "../organisms/plan-registration-container"
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationLayoutProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  plans: PlanListResponse['plans']
  error?: string
}

export function PlanRegistrationLayout({ 
  onPaymentMethodRegister, 
  onCancel, 
  onLogoClick, 
  isLoading, 
  plans,
  error
}: PlanRegistrationLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

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