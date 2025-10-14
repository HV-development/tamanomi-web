import { PlanManagementContainer } from "../organisms/plan-management-container"
import type { Plan } from "../../types/user"

interface PlanManagementLayoutProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onBack: () => void
  onLogoClick: () => void
}

export function PlanManagementLayout({
  plan,
  onChangePlan,
  onCancelSubscription,
  onBack,
  onLogoClick,
}: PlanManagementLayoutProps) {
  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  return (
    <PlanManagementContainer
      plan={plan}
      onChangePlan={onChangePlan}
      onCancelSubscription={onCancelSubscription}
      onBack={onBack}
      onLogoClick={onLogoClick}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
