"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { PlanManagement } from "../molecules/plan-management"
import type { Plan } from "../../types/user"

interface PlanManagementContainerProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onBack: () => void
  onLogoClick: () => void
}

export function PlanManagementContainer({
  plan,
  onChangePlan,
  onCancelSubscription,
  onBack,
  onLogoClick,
}: PlanManagementContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onBack} />

      <div className="p-4 max-w-md mx-auto">
        <PlanManagement plan={plan} onChangePlan={onChangePlan} onCancelSubscription={onCancelSubscription} />
      </div>
    </div>
  )
}
