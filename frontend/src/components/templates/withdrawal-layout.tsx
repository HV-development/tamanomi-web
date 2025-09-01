"use client"

import { WithdrawalContainer } from "../organisms/withdrawal-container"

interface WithdrawalLayoutProps {
  onWithdraw: () => void
  onCancel: () => void
  onWithdrawCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function WithdrawalLayout({ onWithdraw, onCancel, onWithdrawCancel, onLogoClick, isLoading }: WithdrawalLayoutProps) {
  return (
    <WithdrawalContainer
      onWithdraw={onWithdraw}
      onCancel={onCancel}
      onWithdrawCancel={onWithdrawCancel}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
    />
  )
}