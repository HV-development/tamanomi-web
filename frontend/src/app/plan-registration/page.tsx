'use client'

import { PlanRegistrationContainer } from '@/components/organisms/PlanRegistrationContainer'
import { usePlanRegistration } from '@/hooks/usePlanRegistration'

export default function PlanRegistrationPage() {
  const {
    isClient,
    isLoading,
    plans,
    error,
    saitamaAppLinked,
    hasPaymentMethod,
    isPaymentMethodChangeOnly,
    accountStatus,
    handlePaymentMethodRegister,
    handleSaitamaAppLinked,
    handleCancel,
    handleLogoClick,
  } = usePlanRegistration()

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <PlanRegistrationContainer
      backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      onPaymentMethodRegister={handlePaymentMethodRegister}
      onLogoClick={handleLogoClick}
      onCancel={handleCancel}
      isLoading={isLoading}
      plans={plans}
      error={error}
      saitamaAppLinked={saitamaAppLinked || false}
      onSaitamaAppLinked={handleSaitamaAppLinked}
      hasPaymentMethod={hasPaymentMethod}
      isPaymentMethodChangeOnly={isPaymentMethodChangeOnly}
      accountStatus={accountStatus}
    />
  )
}
