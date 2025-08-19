"use client"

import { AlertTriangle, UserX } from "lucide-react"
import { Button } from "../atoms/button"

interface WithdrawalFormProps {
  onWithdraw: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function WithdrawalForm({ onWithdraw, onCancel, isLoading = false }: WithdrawalFormProps) {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">退会手続き</h2>
        <p className="text-gray-600">TAMAYOIサービスからの退会</p>
      </div>

      {/* 説明 */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <div className="font-bold mb-2">退会について</div>
            <div className="space-y-2">
              <p>退会手続きを行うと、{formatDate(nextMonth)}以降はクーポンが利用できなくなります。</p>
              <p>退会後は以下のサービスがご利用いただけなくなります：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>クーポンの利用</li>
                <li>お気に入り店舗の管理</li>
                <li>利用履歴の確認</li>
                <li>決済履歴の確認</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 重要な注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <UserX className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <div className="font-bold mb-2">重要な注意事項</div>
            <ul className="space-y-1">
              <li>• 退会処理は取り消すことができません</li>
              <li>• 現在のサブスクリプションは自動的にキャンセルされます</li>
              <li>• 保存されているデータは全て削除されます</li>
              <li>• 同じメールアドレスでの再登録は可能です</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onWithdraw}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-medium"
        >
          {isLoading ? "退会処理中..." : "退会する"}
        </Button>

        <Button
          onClick={onCancel}
          variant="secondary"
          className="w-full py-3 text-base font-medium"
        >
          キャンセル
        </Button>
      </div>
    </div>
  )
}