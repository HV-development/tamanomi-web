"use client"

import { Button } from '@/components/atoms/Button'
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react'

interface PaymentMethodChangeContainerProps {
  isLoading: boolean
  error: string
  paymentCard: {
    paygentCustomerId: string
    paygentCustomerCardId: string
  } | null
  fromPlanChange: boolean
  onChangePaymentMethod: () => void
  onBack: () => void
}

export function PaymentMethodChangeContainer({
  isLoading,
  error,
  paymentCard,
  fromPlanChange,
  onChangePaymentMethod,
  onBack,
}: PaymentMethodChangeContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            支払い方法の変更
          </h1>
          <p className="text-sm text-gray-600">
            登録済みのクレジットカード情報を変更できます
          </p>
          {fromPlanChange && (
            <p className="text-sm text-purple-600 mt-2">
              プラン変更が完了しました。続けてカード情報を変更します。
            </p>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
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
            onClick={onChangePaymentMethod}
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
            onClick={onBack}
            variant="secondary"
            className="w-full py-3 text-base font-medium"
            disabled={isLoading}
          >
            キャンセル
          </Button>
        </div>

        {/* 注意事項 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
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

