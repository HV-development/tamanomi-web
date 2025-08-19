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
  return (
    <PlanManagementContainer
      plan={plan}
      onChangePlan={onChangePlan}
      onCancelSubscription={onCancelSubscription}
      onBack={onBack}
      onLogoClick={onLogoClick}
    />
  )
}
