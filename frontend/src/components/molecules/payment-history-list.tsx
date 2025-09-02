"use client"

import { CreditCard, Check, Clock, X, ArrowLeft, Home } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { PaymentHistory } from "../../types/user"

interface PaymentHistoryListProps {
  history: PaymentHistory[]
  onBackToMyPage: () => void
  onBackToTop: () => void
  className?: string
}

export function PaymentHistoryList({ 
  history, 
  onBackToMyPage, 
  onBackToTop, 
  className = "" 
}: PaymentHistoryListProps) {
  const formatDate = (date: Date) => {
    return format(date, "yyyy年M月d日 HH:mm", { locale: ja })
  }

  const formatPaymentId = (paymentId: string) => {
    return paymentId.toUpperCase()
  }

  const getStatusIcon = (status: PaymentHistory["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "failed":
        return <X className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusText = (status: PaymentHistory["status"]) => {
    switch (status) {
      case "completed":
        return { text: "完了", color: "text-green-800 bg-green-100 border-green-200" }
      case "pending":
        return { text: "処理中", color: "text-yellow-800 bg-yellow-100 border-yellow-200" }
      case "failed":
        return { text: "失敗", color: "text-red-800 bg-red-100 border-red-200" }
    }
  }

  if (history.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBackToMyPage} 
              className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
            >
              ← 戻る
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 text-green-600">
                🍷
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-green-700 text-lg leading-tight">TAMAYOI</span>
                <span className="text-xs text-green-600 font-medium -mt-1">たまよい</span>
              </div>
            </div>
            <div className="w-12"></div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">決済履歴</h1>
          
          {/* 空の状態 */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-green-700 text-lg font-medium mb-2">まだ決済履歴がありません</div>
            <div className="text-green-600 text-sm">プランに登録すると履歴がここに表示されます</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBackToMyPage} 
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            ← 戻る
          </button>
          <img 
            src="/logo.svg"
            alt="TAMAYOI" 
            className="h-8 object-contain"
          />
      {/* メインコンテンツ */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">決済履歴</h1>

        {/* 決済履歴リスト */}
        <div className="space-y-4">
          {history.map((item, index) => {
            const statusStyle = getStatusText(item.status)
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border-2 border-green-300 p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 決済ID */}
                <div className="mb-4">
                  <div className="text-green-600 font-medium mb-2">決済ID</div>
                  <div className="font-bold text-xl text-gray-900">
                    {formatPaymentId(item.paymentId)}
                  </div>
                </div>

                {/* プラン名 */}
                <div className="mb-4">
                  <div className="text-green-600 font-medium mb-2">プラン名</div>
                  <div className="font-bold text-lg text-gray-900">{item.planName}</div>
                </div>

                {/* 決済金額 */}
                <div className="mb-4">
                  <div className="text-green-600 font-medium mb-2">決済金額</div>
                  <div className="font-bold text-xl text-green-700">¥{item.amount.toLocaleString()}</div>
                </div>

                {/* 決済日 */}
                <div className="mb-4">
                  <div className="text-green-600 font-medium mb-2">決済日</div>
                  <div className="text-gray-900">{formatDate(item.paidAt)}</div>
                </div>

                {/* ステータス */}
                <div>
                  <div className="text-green-600 font-medium mb-2">ステータス</div>
                  <div className="text-gray-900">{statusStyle.text}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 下部ボタン */}
      <div className="p-6 border-t border-green-200">
        <div className="space-y-3 max-w-md mx-auto">
          <button
            onClick={onBackToMyPage}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            マイページに戻る
          </button>
          <button
            onClick={onBackToTop}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-300"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    </div>
  )
}
  )
}