'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getCookie, deleteCookie } from '@/lib/cookie'

interface PayPayFormData {
  action: string
  method: string
  inputs: Array<{ name: string; value: string; type: string }>
}

/**
 * PayPay決済専用画面（Suspense内で動作する実体コンポーネント）
 *
 * DOMParser で redirectHtml を解析し、ネイティブ <form> + type="submit" ボタンとして
 * レンダリングすることで iOS Safari でも確実にフォーム送信できるようにしている。
 */
export function PayPayCheckoutContent() {
  const searchParams = useSearchParams()
  const [redirectHtml, setRedirectHtml] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const payPayFormData = useMemo<PayPayFormData | null>(() => {
    if (!redirectHtml) return null
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(redirectHtml, 'text/html')
      const form = doc.querySelector('form')
      if (!form) return null

      // form.action はパース元ページのベースURLで解決されるため getAttribute で生の値を取得
      const action = form.getAttribute('action') || ''
      const method = form.getAttribute('method') || 'post'
      const inputs = Array.from(form.querySelectorAll('input')).map(input => ({
        name: input.name,
        value: input.value,
        type: input.type,
      }))

      return { action, method, inputs }
    } catch {
      return null
    }
  }, [redirectHtml])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const htmlFromParam = searchParams.get('redirectHtml')
    if (htmlFromParam) {
      setRedirectHtml(decodeURIComponent(htmlFromParam))
    } else {
      // Cookieから取得（保存時に encodeURIComponent しているためデコードする）
      const stored = getCookie('tamanomi_payment_paypayHtml')
      if (stored) {
        try {
          setRedirectHtml(decodeURIComponent(stored))
        } catch {
          setRedirectHtml(stored)
        }
      }
    }
  }, [searchParams])

  if (!redirectHtml || !payPayFormData) {
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
            下の「PayPayへ進む」ボタンをタップして決済画面へ進んでください。
          </p>
        </div>

        <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-900">
          決済が完了すると、自動的にPayPayの画面から戻ります。ブラウザを閉じたり、このタブを更新しないでください。
        </div>

        <div className="p-6 text-center">
          {/* ネイティブ <form> + type="submit" ボタンで送信。iOS Safari でも確実に動作する */}
          <form
            method={payPayFormData.method}
            action={payPayFormData.action}
            onSubmit={() => {
              deleteCookie('tamanomi_payment_paypayHtml')
            }}
          >
            {payPayFormData.inputs
              .filter(input => input.type !== 'submit')
              .map((input, index) => (
                <input
                  key={`${input.name}-${index}`}
                  type="hidden"
                  name={input.name}
                  value={input.value}
                />
              ))}
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-base font-medium"
            >
              PayPayへ進む
            </button>
          </form>
          <p className="mt-3 text-[11px] text-gray-400 break-all">
            送信先: {payPayFormData.action}
          </p>
        </div>
      </div>
    </div>
  )
}
