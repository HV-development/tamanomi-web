"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { PlanChangeForm } from "./PlanChangeForm"
import type { Plan } from "@/types/user"

interface PlanChangeContainerProps {
  currentPlan: Plan
  onPlanChange: (planId: string, alsoChangePaymentMethod?: boolean) => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
}

export function PlanChangeContainer({
  currentPlan,
  onPlanChange,
  onBack,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: PlanChangeContainerProps) {
  const handlePlanChange = (planId: string, alsoChangePaymentMethod?: boolean) => {
    onPlanChange(planId, alsoChangePaymentMethod)
  }

  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onBack} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <PlanChangeForm
              currentPlan={currentPlan}
              onPlanChange={handlePlanChange}
              onCancel={onBack}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
