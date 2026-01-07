'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPayPayTransactionStatus } from '@/lib/api-client'

export function PayPayCompleteContent() {
  const searchParams = useSearchParams()
  const [statusMessage, setStatusMessage] = useState<string>('決済状態を確認しています...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const transactionId =
      searchParams.get('paypay_payment_id') ||
      searchParams.get('payment_id') ||
      searchParams.get('trading_id')

    if (!transactionId) {
      setIsError(true)
      setStatusMessage('決済IDが取得できませんでした。決済を最初からやり直してください。')
      return
    }

    ;(async () => {
      const result = await getPayPayTransactionStatus(transactionId)

      if (result.error) {
        setIsError(true)
        setStatusMessage(result.error.message || '決済状態の取得に失敗しました。時間をおいて再度お試しください。')
        return
      }

      const payload = result.data
      if (!payload) {
        setIsError(true)
        setStatusMessage('決済状態の取得に失敗しました。')
        return
      }

      const status = payload.result.status
      if (status === 'SUCCESS') {
        setIsError(false)
        setStatusMessage('決済が正常に完了しました。プランが有効になりました。')
      } else if (status === 'PROCESSING' || status === 'REQUIRES_ACTION') {
        setIsError(false)
        setStatusMessage('決済処理中です。しばらく経ってからマイページのプラン情報をご確認ください。')
      } else {
        setIsError(true)
        setStatusMessage('決済に失敗しました。再度お試しいただくか、別の支払い方法をご利用ください。')
      }
    })()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">PayPay決済結果</h1>
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-700'} whitespace-pre-line`}>
          {statusMessage}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

