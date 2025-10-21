"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/atoms/button'
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react'

export default function PaymentMethodChangePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [paymentCard, setPaymentCard] = useState<{
    paygentCustomerId: string
    paygentCustomerCardId: string
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPlanChange = searchParams.get('from') === 'plan-change'

  useEffect(() => {
    // ユーザー情報とカード情報を取得
    const fetchUserInfo = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        
        if (!accessToken) {
          setError('認証情報が見つかりません。ログインしてください。')
          return
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
          
          // Mock環境ではカード情報がなくてもエラーにしない
          const isMockMode = process.env.NODE_ENV === 'development' || 
                            localStorage.getItem('USE_MOCK_PAYMENT') === 'true'
          
          if (!userData.paymentCard && !isMockMode) {
            setError('カード情報が登録されていません。')
          }
        } else {
          setError('ユーザー情報の取得に失敗しました。')
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
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
      
      // Mock環境の場合
      const isMockMode = process.env.NODE_ENV === 'development' || 
                        localStorage.getItem('USE_MOCK_PAYMENT') === 'true' ||
                        !paymentCard
      
      if (isMockMode) {
        console.log('🔧 [payment-method-change] Mock mode detected')
        
        // PaymentSessionを作成するため、カード変更APIを呼び出す
        const mockCustomerId = paymentCard?.paygentCustomerId || `cust_${Date.now()}`
        const mockCustomerCardId = paymentCard?.paygentCustomerCardId || 'mock_initial'
        
        console.log('🔧 [payment-method-change] Creating PaymentSession via update API')
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
        console.log('🔧 [payment-method-change] PaymentSession created, redirecting to mock payment')
        
        // Mock決済画面にリダイレクト（PaymentSessionが作成された後）
        const mockUrl = `/payment-mock?customer_id=${mockCustomerId}&operation_type=02`
        console.log('🔧 [payment-method-change] Redirecting to:', mockUrl)
        window.location.href = mockUrl
        return
      }
      
      // 本番環境の場合
      if (!paymentCard) {
        setError('カード情報が見つかりません。')
        setIsLoading(false)
        return
      }
      
      // カード変更APIを呼び出し
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
      console.log('Payment update response:', data)
      
      // Paygentリダイレクト用のフォームを作成して送信
      if (data.redirectUrl && data.params) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.redirectUrl
        
        // パラメータをフォームに追加
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
      console.error('Payment method change error:', error)
      setError(error instanceof Error ? error.message : 'カード変更の準備中にエラーが発生しました')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (fromPlanChange) {
      router.push('/home')
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button 
            onClick={handleBack}
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            ← 戻る
          </button>
          <h1 className="text-lg font-bold text-gray-900">支払い方法変更</h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto mt-6">
        {/* メインカード */}
        <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">支払い方法の変更</h2>
              <p className="text-sm text-gray-600">登録済みのカード情報を変更します</p>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 情報表示 */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-2">変更について</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 安全なペイジェント決済画面に移動します</li>
                <li>• 新しいカード情報を入力してください</li>
                <li>• カード情報は暗号化されて保存されます</li>
                <li>• 変更後、次回から新しいカードで決済されます</li>
              </ul>
            </div>

            {paymentCard && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">現在の登録状態:</span> カード登録済み
                </p>
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="space-y-3">
            <Button
              onClick={handleChangePaymentMethod}
              disabled={isLoading || !!error}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-base font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  処理中...
                </span>
              ) : (
                'カード情報を変更する'
              )}
            </Button>

            <Button
              onClick={handleBack}
              variant="secondary"
              className="w-full py-3 text-base font-medium"
              disabled={isLoading}
            >
              キャンセル
            </Button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">ご注意</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• カード情報の変更には数分かかる場合があります</li>
            <li>• 変更中はブラウザを閉じないでください</li>
            <li>• 変更完了後、確認画面が表示されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

