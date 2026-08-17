"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { PlanRegistrationForm } from "./PlanRegistrationForm"
import type { PaymentMethodType } from '@hv-development/schemas'
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationContainerProps {
  onPaymentMethodRegister: (planId: string, paymentMethod: PaymentMethodType, campaignCode?: string) => void
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
  entryFlow?: string | null
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
  entryFlow,
}: PlanRegistrationContainerProps) {
  // 新規登録の途中はヘッダーを出さない（先方要望）。ログイン直後は履歴が浅くブラウザバックで
  // 抜けられないため、離脱手段として Home ボタンを戻るの位置に置く。
  const isSignupFlow = entryFlow === 'signup'
  const isLoginFlow = entryFlow === 'login'

  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {!isSignupFlow && (
        <HeaderLogo
          onLogoClick={onLogoClick}
          showBackButton={!isLoginFlow}
          onBackClick={onCancel}
          showHomeButton={isLoginFlow}
          onHomeClick={onLogoClick}
          homeButtonPosition="left"
        />
      )}

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