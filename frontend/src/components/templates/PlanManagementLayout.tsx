import { PlanManagementContainer } from "../organisms/PlanManagementContainer"
import type { Plan } from "../../types/user"

interface PlanManagementLayoutProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onChangePaymentMethod?: () => void
  hasPaymentMethod?: boolean
  onBack: () => void
  onLogoClick: () => void
}

export function PlanManagementLayout({
  plan,
  onChangePlan,
  onCancelSubscription,
  onChangePaymentMethod,
  hasPaymentMethod,
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
      onChangePaymentMethod={onChangePaymentMethod}
      hasPaymentMethod={hasPaymentMethod}
      onBack={onBack}
      onLogoClick={onLogoClick}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
