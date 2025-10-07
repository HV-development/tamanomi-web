"use client"

import { WithdrawalContainer } from "../organisms/withdrawal-container"

interface WithdrawalLayoutProps {
  onWithdraw: () => void
  onCancel: () => void
  onWithdrawCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function WithdrawalLayout({ onWithdraw, onCancel, onWithdrawCancel, onLogoClick, isLoading, currentUserRank }: WithdrawalLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <WithdrawalContainer
      onWithdraw={onWithdraw}
      onCancel={onCancel}
      onWithdrawCancel={onWithdrawCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}