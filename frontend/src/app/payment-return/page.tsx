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
        const responseCode = searchParams.get('response_code') // ペイジェントからのレスポンスコード
        
        console.log('🔍 [payment-return] Payment return parameters:', {
          customerId,
          customerCardId,
          errorCode,
          responseCode,
          allParams: Object.fromEntries(searchParams.entries())
        })

        // エラーがある場合（error_code または response_codeをチェック）
        const finalErrorCode = errorCode || responseCode
        if (finalErrorCode && finalErrorCode !== '0' && finalErrorCode !== '00000') {
          // エラーコードに応じたメッセージを表示
          let errorMessage = `カード登録に失敗しました（エラーコード: ${finalErrorCode}）`
          
          if (finalErrorCode === '6005') {
            errorMessage = 'エラーが発生しました。店舗へ連絡してください。（6005）\n\n操作対象のカードが存在しません。新規登録の場合は、このエラーは発生しないはずです。店舗にお問い合わせください。'
          } else if (finalErrorCode === 'P006') {
            errorMessage = 'カード登録に失敗しました。必要な情報が不足しています。'
          } else if (finalErrorCode === 'P008') {
            errorMessage = 'カード登録に失敗しました。入力形式に誤りがあります。'
          } else if (finalErrorCode === 'P009') {
            errorMessage = 'カード登録に失敗しました。入力値の長さが不正です。'
          }
          
          throw new Error(errorMessage)
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

        // ユーザープラン作成APIを呼び出す（プランIDがある場合）
        if (selectedPlanId) {
          console.log('🔍 [payment-return] Creating user plan with planId:', selectedPlanId)
          console.log('🔍 [payment-return] planId type:', typeof selectedPlanId)
          console.log('🔍 [payment-return] planId length:', selectedPlanId.length)
          
          // プランIDの形式をチェック（UUID形式であることを確認）
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (!uuidPattern.test(selectedPlanId)) {
            console.error('❌ Invalid plan ID format (not UUID):', selectedPlanId)
            sessionStorage.removeItem('selectedPlanId')
            sessionStorage.removeItem('userEmail')
            throw new Error('プランIDの形式が正しくありません。プラン選択画面からやり直してください。')
          }
          
          try {
            // アクセストークンを取得
            const accessToken = localStorage.getItem('accessToken')
            console.log('🔍 [payment-return] accessToken from localStorage:', {
              hasToken: !!accessToken,
              tokenLength: accessToken?.length,
              tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'null'
            })
            
            if (!accessToken) {
              throw new Error('認証情報が見つかりません。ログインしてください。')
            }

            console.log('🔍 [payment-return] Sending request to /api/user-plans/create')
            console.log('🔍 [payment-return] Request body:', { planId: selectedPlanId })
            console.log('🔍 [payment-return] Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`)

            // プラン作成APIを呼び出し
            const createPlanResponse = await fetch('/api/user-plans/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                planId: selectedPlanId,
              }),
            })

            console.log('🔍 [payment-return] Response status:', createPlanResponse.status)
            console.log('🔍 [payment-return] Response ok:', createPlanResponse.ok)

            if (!createPlanResponse.ok) {
              const errorData = await createPlanResponse.json().catch(() => ({}))
              throw new Error(errorData.message || 'プラン登録に失敗しました')
            }

            const planData = await createPlanResponse.json()
            console.log('✅ [payment-return] User plan created successfully:', planData)
          } catch (planError) {
            console.error('❌ [payment-return] Failed to create user plan:', planError)
            throw new Error(`プラン登録に失敗しました: ${planError instanceof Error ? planError.message : 'Unknown error'}`)
          }
        }
        
        // 処理完了
        setIsProcessing(false)

        // sessionStorageをクリア
        sessionStorage.removeItem('selectedPlanId')
        sessionStorage.removeItem('userEmail')
        sessionStorage.removeItem('paygentCustomerId')
        sessionStorage.removeItem('paygentCustomerCardId')

        // ★一時的な対応：決済完了後はマイページに遷移
        // 正式リリース時には店舗一覧画面（/home）に遷移する予定
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

