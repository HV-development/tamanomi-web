import { PlanChangeContainer } from "../organisms/plan-change-container"
import type { Plan } from "../../types/user"

interface PlanChangeLayoutProps {
  currentPlan: Plan
  onPlanChange: (planId: string) => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function PlanChangeLayout({ currentPlan, onPlanChange, onBack, onLogoClick, isLoading }: PlanChangeLayoutProps) {
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <PlanChangeContainer
      currentPlan={currentPlan}
      onPlanChange={onPlanChange}
      onBack={onBack}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
