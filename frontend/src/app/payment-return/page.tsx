'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const customerId = searchParams.get('customer_id')
        const customerCardId = searchParams.get('customer_card_id')
        const errorCode = searchParams.get('error_code')
        
        console.log('Payment return parameters:', {
          customerId,
          customerCardId,
          errorCode
        })

        // エラーがある場合
        if (errorCode) {
          throw new Error(`カード登録に失敗しました（エラーコード: ${errorCode}）`)
        }

        if (!customerId) {
          throw new Error('顧客IDが見つかりません')
        }

        // カード情報をsessionStorageに保存
        if (customerCardId) {
          sessionStorage.setItem('paygentCustomerId', customerId)
          sessionStorage.setItem('paygentCustomerCardId', customerCardId)
        }

        console.log('Card registration successful:', { customerId, customerCardId })

        // PaymentSessionから情報を取得（sessionStorageのフォールバック付き）
        let selectedPlanId: string | null = null
        let userEmail: string | null = null

        try {
          // まずバックエンドのPaymentSessionから取得を試みる
          const sessionResponse = await fetch(`/api/payment/session/${customerId}`)
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            selectedPlanId = sessionData.planId || null
            userEmail = sessionData.userEmail
            console.log('Retrieved from PaymentSession:', { selectedPlanId, userEmail })
          } else {
            console.log('PaymentSession not found, falling back to sessionStorage')
            // フォールバック: sessionStorageから取得
            selectedPlanId = sessionStorage.getItem('selectedPlanId')
            userEmail = sessionStorage.getItem('userEmail')
            console.log('Retrieved from sessionStorage:', { selectedPlanId, userEmail })
          }
        } catch (error) {
          console.error('Failed to retrieve PaymentSession, using sessionStorage:', error)
          // エラー時もsessionStorageにフォールバック
          selectedPlanId = sessionStorage.getItem('selectedPlanId')
          userEmail = sessionStorage.getItem('userEmail')
        }

        if (!userEmail) {
          throw new Error('ユーザー情報が見つかりません')
        }

        // TODO: ユーザープラン作成APIを呼び出す（プランIDがある場合）
        if (selectedPlanId) {
          console.log('TODO: Create user plan with planId:', selectedPlanId)
        }
        
        // 処理完了
        setIsProcessing(false)

        // sessionStorageをクリア
        sessionStorage.removeItem('selectedPlanId')
        sessionStorage.removeItem('userEmail')
        sessionStorage.removeItem('paygentCustomerId')
        sessionStorage.removeItem('paygentCustomerCardId')

        // マイページに遷移
        setTimeout(() => {
          router.push('/home?view=mypage&payment-success=true')
        }, 2000)

      } catch (err) {
        console.error('Payment return error:', err)
        setError(err instanceof Error ? err.message : 'カード登録の処理に失敗しました')
        setIsProcessing(false)
      }
    }

    processPaymentReturn()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              トップページに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="mb-4 text-green-500">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            ) : (
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isProcessing ? 'カード登録を処理中...' : 'カード登録完了'}
          </h2>
          <p className="text-gray-600">
            {isProcessing
              ? 'しばらくお待ちください'
              : 'トップページに移動します...'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  )
}

