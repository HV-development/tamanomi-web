"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { PlanRegistrationForm } from "./PlanRegistrationForm"
import type { PaymentMethodType } from '@/types/payment'
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationContainerProps {
  onPaymentMethodRegister: (planId: string, paymentMethod: PaymentMethodType) => void
  onCancel: () => void
  onLogoClick: () => void
  isLoading?: boolean
  backgroundColorClass?: string
  plans: PlanListResponse['plans']
  error?: string
  saitamaAppLinked?: boolean
  onSaitamaAppLinked?: () => void
  hasPaymentMethod?: boolean
  isPaymentMethodChangeOnly?: boolean
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
  hasPaymentMethod,
  isPaymentMethodChangeOnly,
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
              hasPaymentMethod={hasPaymentMethod}
              isPaymentMethodChangeOnly={isPaymentMethodChangeOnly}
            />
          </div>
        </div>
      </div>
    </div>
  )
}