'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * PayPay決済専用画面（Suspense内で動作する実体コンポーネント）
 */
export function PayPayCheckoutContent() {
  const searchParams = useSearchParams()
  const [redirectHtml, setRedirectHtml] = useState<string | null>(null)

  useEffect(() => {
    const htmlFromParam = searchParams.get('redirectHtml')
    if (htmlFromParam) {
      const decoded = decodeURIComponent(htmlFromParam)
      setRedirectHtml(decoded)
    } else {
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('paypayRedirectHtml') : null
      if (stored) {
        setRedirectHtml(stored)
      }
    }
  }, [searchParams])

  if (!redirectHtml) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-4">
          <h1 className="text-lg font-bold text-gray-900">PayPay決済の情報が見つかりません</h1>
          <p className="text-sm text-gray-600">
            決済を最初からやり直してください。<br />
            それでも解決しない場合は、お問い合わせフォームからご連絡ください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">PayPayでお支払い</h1>
          <p className="text-xs text-gray-600 mt-1">
            この画面に表示されるPayPayの支払い画面から決済を完了してください。
          </p>
        </div>

        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-900">
          決済が完了すると、自動的にPayPayの画面から戻ります。ブラウザを閉じたり、このタブを更新しないでください。
        </div>

        <div className="p-4">
          <div
            dangerouslySetInnerHTML={{ __html: redirectHtml }}
          />
        </div>
      </div>
    </div>
  )
}



