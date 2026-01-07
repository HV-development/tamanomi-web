'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PaymentMockContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  })
  const [customerId, setCustomerId] = useState<string>('')

  // POSTリクエストからcustomer_idを取得
  useEffect(() => {
    // URLパラメータから取得を試行
    const urlCustomerId = searchParams.get('customer_id')
    if (urlCustomerId) {
      setCustomerId(urlCustomerId)
      return
    }

    // POSTリクエストのボディから取得は handleSubmit 内で処理
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      const mockCustomerCardId = 'mock_' + Date.now()
      
      // customer_idを取得（URLパラメータまたはフォームデータから）
      let currentCustomerId = customerId
      
      // フォームデータからcustomer_idを取得
      const formData = new FormData(e.target as HTMLFormElement)
      const formCustomerId = formData.get('customer_id') as string
      
      if (formCustomerId) {
        currentCustomerId = formCustomerId
        setCustomerId(formCustomerId)
      }
      
      if (!currentCustomerId) {
        alert('エラー: customer_idパラメータが見つかりません')
        setIsProcessing(false)
        return
      }
      
      // WebhookをAPIに送信（実際のPaygentと同じフロー）
      // ハッシュは64文字必要（SHA-256ハッシュの16進数表現）
      const mockHash = 'mock_hash_' + Date.now().toString().padEnd(54, '0') // 64文字にパディング
      
      const webhookResponse = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: currentCustomerId,
          customer_card_id: mockCustomerCardId,
          operation_type: '01', // 登録
          update_date: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
          hc: mockHash
        })
      })
      
      if (!webhookResponse.ok) {
        alert('エラー: Webhook処理に失敗しました')
        setIsProcessing(false)
        return
      }
      
      // 少し待ってから戻りURLへリダイレクト
      setTimeout(() => {
        const returnUrl = `/payment-return?customer_id=${currentCustomerId}&customer_card_id=${mockCustomerCardId}`
        router.push(returnUrl)
      }, 1000)
      
    } catch {
      alert('エラーが発生しました')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            クレジットカード登録（テスト環境）
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            これはテスト環境のモック画面です
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Debug Info:</strong><br/>
              customer_id: {customerId || searchParams.get('customer_id') || 'なし'}<br/>
              return_url: {searchParams.get('return_url') || 'なし'}
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                テスト環境モック画面
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>実際のペイジェント環境では、ここでカード情報を入力します。</p>
                <p>現在はテスト用のモック画面を表示しています。</p>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Hidden input for customer_id from POST data */}
          {customerId && (
            <input type="hidden" name="customer_id" value={customerId} />
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                カード番号
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardInfo.cardNumber}
                onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  有効期限
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={cardInfo.expiryDate}
                  onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  placeholder="123"
                  value={cardInfo.cvv}
                  onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700">
                カード名義人
              </label>
              <input
                id="cardHolderName"
                name="cardHolderName"
                type="text"
                placeholder="TARO YAMADA"
                value={cardInfo.cardHolderName}
                onChange={(e) => setCardInfo({...cardInfo, cardHolderName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isProcessing}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </>
              ) : (
                'カードを登録する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaymentMockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PaymentMockContent />
    </Suspense>
  )
}
