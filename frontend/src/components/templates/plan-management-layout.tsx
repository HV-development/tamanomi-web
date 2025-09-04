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
    if (!rank) {
      return "bg-gradient-to-br from-green-50 to-green-100" // 非会員・ブロンズ
    }
    
    switch (rank) {
      case "bronze":
        return "bg-gradient-to-br from-green-50 to-green-100"
      case "silver":
        return "bg-gradient-to-br from-rose-50 to-rose-100"
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-amber-100"
      case "diamond":
        return "bg-gradient-to-br from-sky-50 to-sky-100"
      default:
        return "bg-gradient-to-br from-green-50 to-green-100"
    }
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
