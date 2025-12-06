"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const usePaymentMethodChange = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [paymentCard, setPaymentCard] = useState<{
    paygentCustomerId: string
    paygentCustomerCardId: string
  } | null>(null)
  const [useMockPayment, setUseMockPayment] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPlanChange = searchParams.get('from') === 'plan-change'

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Cookieベースの認証のみを使用（localStorageは廃止）
        // モックモード状態を取得
        let isMockMode = false
        const mockStatusResponse = await fetch('/api/payment/mock-status', {
          cache: 'no-store',
        })

        if (mockStatusResponse.ok) {
          const mockStatus = await mockStatusResponse.json()
          isMockMode = mockStatus.useMockPayment
          setUseMockPayment(mockStatus.useMockPayment)
        }

        const response = await fetch('/api/user/me', {
          cache: 'no-store',
          credentials: 'include', // Cookieを送信
        })

        if (response.ok) {
          const userData = await response.json()
          setUserEmail(userData.email)
          setPaymentCard(userData.paymentCard)

          // モックモードでない場合のみ、カード情報がないことをエラーとする
          if (!userData.paymentCard && !isMockMode) {
            setError('カード情報が登録されていません。')
          }
        } else {
          setError('ユーザー情報の取得に失敗しました。')
        }
      } catch {
        setError('ユーザー情報の取得中にエラーが発生しました。')
      }
    }

    fetchUserInfo()
  }, [])

  const handleChangePaymentMethod = async () => {
    try {
      setIsLoading(true)
      setError('')

      if (!userEmail || userEmail.trim() === '') {
        setError('メールアドレスが見つかりません。')
        setIsLoading(false)
        return
      }

      // モックモードの判定
      const isMockMode = useMockPayment || !paymentCard

      // モックモードの場合
      if (isMockMode) {
        const mockCustomerId = paymentCard?.paygentCustomerId || `cust_${Date.now()}`
        const mockCustomerCardId = paymentCard?.paygentCustomerCardId || 'mock_initial'

        const response = await fetch('/api/payment/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: mockCustomerId,
            customerCardId: mockCustomerCardId,
            userEmail: userEmail,
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'PaymentSession作成に失敗しました')
        }

        await response.json()

        // モック画面にリダイレクト
        const mockUrl = `/payment-mock?customer_id=${mockCustomerId}&operation_type=02`
        window.location.href = mockUrl
        return
      }

      // 実際のPayGent連携の場合
      if (!paymentCard) {
        setError('カード情報が見つかりません。')
        setIsLoading(false)
        return
      }

      // PayGentへのカード変更申込（リンクタイプ方式）
      // customerIdとuserEmailを送信
      // planIdは送信しない（planIdがない場合、バックエンドで支払い方法変更と判定される）
      const requestBody: Record<string, string> = {
        customerId: paymentCard.paygentCustomerId,
        userEmail: userEmail,
      }

      const response = await fetch('/api/payment/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'カード変更の準備に失敗しました')
      }

      const data = await response.json()

      // PayGentのカード変更画面にリダイレクト
      if (data.redirectUrl && data.params) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.redirectUrl

        Object.keys(data.params).forEach(key => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = data.params[key]
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        throw new Error('PayGentからのリダイレクト情報が取得できませんでした')
      }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'カード変更の準備中にエラーが発生しました')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (fromPlanChange) {
      router.push('/home')
    } else {
      router.push('/home?view=mypage')
    }
  }

  return {
    isLoading,
    error,
    userEmail,
    paymentCard,
    fromPlanChange,
    handleChangePaymentMethod,
    handleBack,
  }
}

