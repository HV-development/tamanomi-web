"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { PlanManagement } from "@/components/molecules/PlanManagement"
import type { Plan } from "@/types/user"

interface PlanManagementContainerProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onChangePaymentMethod?: () => void
  hasPaymentMethod?: boolean
  onBack: () => void
  onLogoClick: () => void
  backgroundColorClass?: string
}

export function PlanManagementContainer({
  plan,
  onChangePlan,
  onCancelSubscription,
  onChangePaymentMethod,
  hasPaymentMethod,
  onBack,
  onLogoClick,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: PlanManagementContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass}`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onBack} />

      <div className="p-4 max-w-md mx-auto">
        <PlanManagement 
          plan={plan} 
          onChangePlan={onChangePlan} 
          onCancelSubscription={onCancelSubscription}
          onChangePaymentMethod={onChangePaymentMethod}
          hasPaymentMethod={hasPaymentMethod}
        />
      </div>
    </div>
  )
}
