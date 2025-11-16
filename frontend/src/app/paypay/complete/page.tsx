'use client'

import { Suspense } from 'react'
import { PayPayCompleteContent } from './paypay-complete-content'

export default function PayPayCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-4 text-center">
            <h1 className="text-xl font-bold text-gray-900">PayPay決済結果</h1>
            <p className="text-sm text-gray-700">決済状態を確認しています...</p>
          </div>
        </div>
      }
    >
      <PayPayCompleteContent />
    </Suspense>
  )
}

