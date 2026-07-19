"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { useMyActiveCampaign } from "@/hooks/useMyActiveCampaign"

interface WithdrawalConfirmationProps {
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function WithdrawalConfirmation({ onConfirm, onCancel, isLoading = false }: WithdrawalConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const disabled = isLoading || isSubmitting
  const { hasActiveCampaign } = useMyActiveCampaign()

  const handleConfirm = async () => {
    if (disabled) return
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8">
        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            退会確認画面
          </h2>
          
          {/* 警告アイコン */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="text-gray-700 mb-6">
            退会手続き前にご確認ください
          </div>
        </div>

        {/* 重要な注意事項 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="text-sm text-red-800 leading-relaxed">
            <div className="font-bold text-red-900 mb-2">重要なご注意事項</div>
            <ul className="space-y-2">
              <li>1. 退会後にデータを復旧することはできません。再度ご利用いただく場合は、新規登録が必要となります。</li>
              {hasActiveCampaign ? (
                <li>2. 退会されると、キャンペーンの無料期間は終了し、無料ではサービスをご利用いただけません。</li>
              ) : (
                <li>2. 退会手続き後も、ご契約期間の終了日まではサービスをご利用いただけます。</li>
              )}
              <li>3. 契約期間終了後は自動的にアカウントが無効になります。</li>
              {hasActiveCampaign && (
                <li>4. 退会後に新規登録されても、キャンペーン対象外となります。</li>
              )}
            </ul>
          </div>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={disabled}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-xl"
          >
            {disabled ? "退会処理中..." : "解約する"}
          </Button>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="w-full py-3 text-base font-medium rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}