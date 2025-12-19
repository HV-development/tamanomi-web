'use client'

import { Suspense } from 'react'
import { PayPayCheckoutContent } from './paypay-checkout-content'

export default function PayPayCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-4">
            <h1 className="text-lg font-bold text-gray-900">PayPayでお支払い</h1>
            <p className="text-sm text-gray-600">決済画面を読み込んでいます...</p>
          </div>
        </div>
      }
    >
      <PayPayCheckoutContent />
    </Suspense>
  )
}

