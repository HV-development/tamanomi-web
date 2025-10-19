"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { PlanRegistrationForm } from "../molecules/plan-registration-form"
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationContainerProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
  plans: PlanListResponse['plans']
  error?: string
  saitamaAppLinked?: boolean
  onSaitamaAppLinked?: () => void
}

export function PlanRegistrationContainer({
  onPaymentMethodRegister,
  onCancel,
  onLogoClick,
  isLoading,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
  plans,
  error,
  saitamaAppLinked,
  onSaitamaAppLinked,
}: PlanRegistrationContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onCancel} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <PlanRegistrationForm
              onPaymentMethodRegister={onPaymentMethodRegister}
              onCancel={onCancel}
              isLoading={isLoading}
              plans={plans}
              error={error}
              saitamaAppLinked={saitamaAppLinked}
              onSaitamaAppLinked={onSaitamaAppLinked}
            />
          </div>
        </div>
      </div>
    </div>
  )
}