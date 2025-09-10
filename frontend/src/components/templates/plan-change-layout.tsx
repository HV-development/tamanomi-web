import { PlanChangeContainer } from "../organisms/plan-change-container"
import type { Plan } from "../../types/user"

interface PlanChangeLayoutProps {
  currentPlan: Plan
  onPlanChange: (planId: string) => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function PlanChangeLayout({ currentPlan, onPlanChange, onBack, onLogoClick, isLoading, currentUserRank }: PlanChangeLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

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
