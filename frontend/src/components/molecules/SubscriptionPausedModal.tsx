"use client"

import { Info, X } from "lucide-react"

interface SubscriptionPausedModalProps {
  isOpen: boolean
  mode?: 'preCheck' | 'apiError'
  onChangePayment: () => void
  onClose: () => void
}

export function SubscriptionPausedModal({
  isOpen,
  mode = 'preCheck',
  onChangePayment,
  onClose,
}: SubscriptionPausedModalProps) {
  if (!isOpen) return null

  const title = mode === 'apiError'
    ? 'クーポンをご利用いただけませんでした'
    : 'お支払い方法のご確認をお願いします'

  const message = mode === 'apiError'
    ? 'お支払い状況が更新されています。お手数ですが、ページを再読み込みしてご確認ください。'
    : 'ご登録のお支払いカードで決済ができなかったため、クーポンをご利用いただけません。お支払い方法をご変更ください。'

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto border-2 border-amber-200">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Info className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* メッセージ */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {message}
          </p>

          {/* ボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onChangePayment}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              支払い方法を変更する
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
