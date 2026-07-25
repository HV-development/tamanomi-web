"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { WithdrawalConfirmation } from "@/components/molecules/WithdrawalConfirmation"
import type { PlanManagementCampaignInfo } from "@/components/molecules/PlanManagement"

interface WithdrawalContainerProps {
  onWithdraw: () => void
  onCancel: () => void
  onWithdrawCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
  campaignInfo?: PlanManagementCampaignInfo | null
}

export function WithdrawalContainer({ onWithdraw, onWithdrawCancel, onLogoClick, isLoading, backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100", campaignInfo = null }: WithdrawalContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onWithdrawCancel} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <WithdrawalConfirmation onConfirm={onWithdraw} onCancel={onWithdrawCancel} isLoading={isLoading} campaignInfo={campaignInfo} />
        </div>
      </div>
    </div>
  )
}