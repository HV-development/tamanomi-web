'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function PayPayCompleteContent() {
  const searchParams = useSearchParams()
  const [statusMessage, setStatusMessage] = useState<string>('決済状態を確認しています...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    // Paygent はリダイレクト時に result パラメータを付与する（0=成功）
    const result = searchParams.get('result')
    const paymentId =
      searchParams.get('paypay_payment_id') ||
      searchParams.get('payment_id') ||
      searchParams.get('trading_id')

    if (!paymentId) {
      setIsError(true)
      setStatusMessage('決済IDが取得できませんでした。決済を最初からやり直してください。')
      return
    }

    if (result === '0') {
      // result=0 は Paygent が決済受付成功を示す
      setIsError(false)
      setStatusMessage('PayPay決済が完了しました。\nプランの有効化には少々お時間がかかる場合があります。\nしばらく経ってからマイページのプラン情報をご確認ください。')
    } else if (result !== null) {
      // result が存在するが 0 以外 → 決済失敗
      setIsError(true)
      setStatusMessage('決済に失敗しました。再度お試しいただくか、別の支払い方法をご利用ください。')
    } else {
      // result パラメータがない場合（キャンセル等）→ 処理中として扱う
      setIsError(false)
      setStatusMessage('決済処理中です。\nしばらく経ってからマイページのプラン情報をご確認ください。')
    }
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

