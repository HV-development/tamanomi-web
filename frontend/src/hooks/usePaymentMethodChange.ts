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
        const accessToken = localStorage.getItem('accessToken')
        
        if (!accessToken) {
          setError('認証情報が見つかりません。ログインしてください。')
          return
        }

        // モックモード状態を取得
        const mockStatusResponse = await fetch('/api/payment/mock-status', {
          cache: 'no-store',
        })
        
        if (mockStatusResponse.ok) {
          const mockStatus = await mockStatusResponse.json()
          setUseMockPayment(mockStatus.useMockPayment)
        }

        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        })

        if (response.ok) {
          const userData = await response.json()
          setUserEmail(userData.email)
          setPaymentCard(userData.paymentCard)
          
          if (!userData.paymentCard && !useMockPayment) {
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
  }, [useMockPayment])

  const handleChangePaymentMethod = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      if (!userEmail || userEmail.trim() === '') {
        setError('メールアドレスが見つかりません。')
        setIsLoading(false)
        return
      }
      
      const isMockMode = useMockPayment || !paymentCard
      
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
        
        const mockUrl = `/payment-mock?customer_id=${mockCustomerId}&operation_type=02`
        window.location.href = mockUrl
        return
      }
      
      if (!paymentCard) {
        setError('カード情報が見つかりません。')
        setIsLoading(false)
        return
      }
      
      const response = await fetch('/api/payment/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: paymentCard.paygentCustomerId,
          customerCardId: paymentCard.paygentCustomerCardId,
          userEmail: userEmail,
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'カード変更の準備に失敗しました')
      }
      
      const data = await response.json()
      
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

