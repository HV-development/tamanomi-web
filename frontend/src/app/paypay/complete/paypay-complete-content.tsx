'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function PayPayCompleteContent() {
  const searchParams = useSearchParams()
  const [statusMessage, setStatusMessage] = useState<string>('決済状態を確認しています...')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const requestId = searchParams.get('requestId')
    // Paygentがリダイレクト時に付与するpayment_id（Paygent割り当てID）を優先使用
    // フォールバックとして自社生成のpaymentIdも参照
    const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId')
    const paypayPaymentId = searchParams.get('paypay_payment_id')?.trim()

    if (!requestId || !paymentId) {
      setIsLoading(false)
      setIsError(true)
      setStatusMessage('決済情報が取得できませんでした。決済を最初からやり直してください。')
      return
    }

    if (!paypayPaymentId) {
      setIsLoading(false)
      setIsError(true)
      setStatusMessage(
        'リダイレクトに PayPay 決済番号がありません。決済が成功している場合は数分後にマイページを確認するか、しばらくしてから再度お試しください（Webhook で反映される場合があります）。',
      )
      return
    }

    fetch('/api/payment/paypay/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        paymentId,
        paypayPaymentId,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setIsError(true)
          setStatusMessage(data?.error?.message || '決済状態の確認に失敗しました。しばらく経ってからマイページのプラン情報をご確認ください。')
          return
        }
        if (data.status === 'SUCCESS') {
          setIsError(false)
          setStatusMessage('PayPay決済が完了しました。\nプランが有効化されました。マイページでプラン情報をご確認ください。')
        } else {
          setIsError(true)
          setStatusMessage('決済が完了していません。\nしばらく経ってからマイページのプラン情報をご確認ください。')
        }
      })
      .catch(() => {
        setIsError(true)
        setStatusMessage('決済状態の確認中にエラーが発生しました。\nしばらく経ってからマイページのプラン情報をご確認ください。')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">PayPay決済結果</h1>
        {isLoading ? (
          <p className="text-sm text-gray-500">決済状態を確認しています...</p>
        ) : (
          <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-700'} whitespace-pre-line`}>
            {statusMessage}
          </p>
        )}
        {!isLoading && (
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
            >
              トップページに戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

