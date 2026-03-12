'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getCookie, deleteCookie } from '@/lib/cookie'

/**
 * PayPay決済専用画面（Suspense内で動作する実体コンポーネント）
 */
export function PayPayCheckoutContent() {
  const searchParams = useSearchParams()
  const [redirectHtml, setRedirectHtml] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formAction, setFormAction] = useState<string | null>(null)
  const submitContainerRef = useRef<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)
  const cookieDeletedRef = useRef(false)

  const canShowManualSubmit = useMemo(() => !!redirectHtml && !isSubmitted, [redirectHtml, isSubmitted])

  const submitPayPayForm = () => {
    const root = submitContainerRef.current ?? document
    const form = root.querySelector('form') as HTMLFormElement | null
    if (!form) return false
    setFormAction(form.action || null)
    form.submit()
    return true
  }

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const htmlFromParam = searchParams.get('redirectHtml')
    if (htmlFromParam) {
      const decoded = decodeURIComponent(htmlFromParam)
      setRedirectHtml(decoded)
    } else {
      // Cookieから取得（保存時に encodeURIComponent しているためデコードする）
      const stored = getCookie('tamanomi_payment_paypayHtml')
      if (stored) {
        try {
          setRedirectHtml(decodeURIComponent(stored))
        } catch {
          // 既にデコード済みや不正な値の場合はそのまま使用
          setRedirectHtml(stored)
        }
      }
    }
  }, [searchParams])

  // フォームを自動的にサブミット（すべてのフックは条件分岐の前に呼び出す必要がある）
  useEffect(() => {
    if (redirectHtml) {
      // DOMが更新された後にフォームを探してサブミット
      const timer = setTimeout(() => {
        // iOS/Safari での制限やフォーム構造差分に備え、埋め込んだ領域内の最初の form を送信する
        if (submitPayPayForm()) {
          setIsSubmitted(true)
          if (!cookieDeletedRef.current) {
            cookieDeletedRef.current = true
            // 使用後は削除（送信できた場合のみ）
            deleteCookie('tamanomi_payment_paypayHtml')
          }
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [redirectHtml])

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
            PayPayの決済画面に自動的にリダイレクトします...
          </p>
        </div>

        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-900">
          決済が完了すると、自動的にPayPayの画面から戻ります。ブラウザを閉じたり、このタブを更新しないでください。
        </div>

        <div
          ref={submitContainerRef}
          className="p-4"
          style={{
            position: 'absolute',
            left: -99999,
            top: 0,
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: redirectHtml }} />
        </div>

        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">PayPayの決済画面に移動しています...</p>
          {formAction && (
            <p className="mt-2 text-[11px] text-gray-500 break-all">
              送信先: {formAction}
            </p>
          )}
          {canShowManualSubmit && (
            <button
              type="button"
              onClick={() => {
                if (submitPayPayForm()) {
                  setIsSubmitted(true)
                  if (!cookieDeletedRef.current) {
                    cookieDeletedRef.current = true
                    deleteCookie('tamanomi_payment_paypayHtml')
                  }
                }
              }}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              PayPayへ進む
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

