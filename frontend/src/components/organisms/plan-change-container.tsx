"use client"

import { useState } from "react"
import { HeaderLogo } from "../atoms/header-logo"
import { PlanChangeForm } from "../molecules/plan-change-form"
import type { Plan } from "../../types/user"

interface PlanChangeContainerProps {
  currentPlan: Plan
  onPlanChange: (planId: string) => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function PlanChangeContainer({
  currentPlan,
  onPlanChange,
  onBack,
  onLogoClick,
  isLoading,
}: PlanChangeContainerProps) {
  const handlePlanChange = (planId: string) => {
    onPlanChange(planId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex flex-col">
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
