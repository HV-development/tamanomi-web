import { PlanManagementContainer } from "../organisms/plan-management-container"
import type { Plan } from "../../types/user"

interface PlanManagementLayoutProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onBack: () => void
  onLogoClick: () => void
  currentUserRank?: string | null
}

export function PlanManagementLayout({
  plan,
  onChangePlan,
  onCancelSubscription,
  onBack,
  onLogoClick,
  currentUserRank,
}: PlanManagementLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

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
