"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const usePaymentReturn = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPaymentMethodChangeOnly, setIsPaymentMethodChangeOnly] = useState(false)
  const hasProcessedRef = useRef(false)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    // 既に処理済み、または処理中の場合はスキップ
    if (hasProcessedRef.current || isProcessingRef.current) {
      return
    }

    // 処理開始フラグを立てる
    isProcessingRef.current = true

    const processPaymentReturn = async () => {
      try {
        const customerId = searchParams.get('customer_id')
        const customerCardId = searchParams.get('customer_card_id')
        const errorCode = searchParams.get('error_code')
        const responseCode = searchParams.get('response_code')

        // エラーチェック
        const finalErrorCode = errorCode || responseCode
        if (finalErrorCode && finalErrorCode !== '0' && finalErrorCode !== '00000') {
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

        // PaymentSessionから情報を取得
        let selectedPlanId: string | null = null
        let userEmail: string | null = null

        try {
          const sessionResponse = await fetch(`/api/payment/session/${customerId}`)
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            selectedPlanId = sessionData.planId || null
            userEmail = sessionData.userEmail
          } else {
            selectedPlanId = sessionStorage.getItem('selectedPlanId')
            userEmail = sessionStorage.getItem('userEmail')
          }
        } catch {
          selectedPlanId = sessionStorage.getItem('selectedPlanId')
          userEmail = sessionStorage.getItem('userEmail')
        }

        if (!userEmail) {
          throw new Error('ユーザー情報が見つかりません')
        }

        // ユーザープラン作成（プランIDがある場合のみ）
        const isPaymentMethodChange = !selectedPlanId
        setIsPaymentMethodChangeOnly(isPaymentMethodChange)
        
        if (selectedPlanId) {
          // Cookieベースの認証のみを使用（localStorageは廃止）
          const createPlanResponse = await fetch('/api/user-plans/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Cookieを送信
            body: JSON.stringify({
              planId: selectedPlanId,
            }),
          })

          if (!createPlanResponse.ok) {
            const errorData = await createPlanResponse.json().catch(() => ({}))
            console.error('❌ [usePaymentReturn] Plan creation failed:', {
              status: createPlanResponse.status,
              errorData,
            })
            
            let errorMessage = 'プラン登録に失敗しました'
            if (errorData.message) {
              errorMessage = errorData.message
            } else if (createPlanResponse.status === 401) {
              errorMessage = '認証エラー: ログインしてください'
            } else if (createPlanResponse.status === 404) {
              errorMessage = '指定されたプランが見つかりません'
            } else if (createPlanResponse.status === 409) {
              errorMessage = 'このプランは既に登録されています'
            }
            
            throw new Error(errorMessage)
          }

          await createPlanResponse.json()
        }

        // PaymentSessionをクリーンアップ（成功時のみ）
        try {
          await fetch(`/api/payment/session/${customerId}`, {
            method: 'DELETE',
          })
        } catch {
          // クリーンアップ失敗
        }

        // sessionStorageをクリア
        sessionStorage.removeItem('selectedPlanId')
        sessionStorage.removeItem('userEmail')

        // 処理完了
        setIsProcessing(false)
        hasProcessedRef.current = true
        isProcessingRef.current = false

        // 2秒後にリダイレクト
        setTimeout(() => {
          if (isPaymentMethodChangeOnly) {
            router.push('/home?payment-method-change-success=true')
          } else {
            router.push('/home?payment-success=true')
          }
        }, 2000)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'カード登録処理中にエラーが発生しました')
        setIsProcessing(false)
        hasProcessedRef.current = true
        isProcessingRef.current = false
      }
    }

    processPaymentReturn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  return {
    isProcessing,
    error,
    isPaymentMethodChangeOnly,
  }
}

