"use client"

import { Suspense } from 'react'
import { usePaymentMethodChange } from '@/hooks/usePaymentMethodChange'
import { PaymentMethodChangeContainer } from '@/components/organisms/PaymentMethodChangeContainer'

function PaymentMethodChangeContent() {
  const {
    isLoading,
    error,
    paymentCard,
    fromPlanChange,
    handleChangePaymentMethod,
    handleBack,
  } = usePaymentMethodChange()

  return (
    <PaymentMethodChangeContainer
      isLoading={isLoading}
      error={error}
      paymentCard={paymentCard}
      fromPlanChange={fromPlanChange}
      onChangePaymentMethod={handleChangePaymentMethod}
      onBack={handleBack}
    />
  )
}

export default function PaymentMethodChangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PaymentMethodChangeContent />
    </Suspense>
  )
}
