'use client'

import { Suspense } from 'react'
import { usePaymentReturn } from '@/hooks/usePaymentReturn'
import { PaymentReturnContainer } from '@/components/organisms/PaymentReturnContainer'

function PaymentReturnContent() {
  const { isProcessing, error, isPaymentMethodChangeOnly } = usePaymentReturn()

  return (
    <PaymentReturnContainer
      isProcessing={isProcessing}
      error={error}
      isPaymentMethodChangeOnly={isPaymentMethodChangeOnly}
    />
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  )
}
