"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { WithdrawalConfirmation } from "../molecules/withdrawal-confirmation"

interface WithdrawalContainerProps {
  onWithdraw: () => void
  onCancel: () => void
  onWithdrawCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function WithdrawalContainer({ onWithdraw, onCancel, onWithdrawCancel, onLogoClick, isLoading }: WithdrawalContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onWithdrawCancel} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <WithdrawalConfirmation onConfirm={onWithdraw} onCancel={onWithdrawCancel} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}