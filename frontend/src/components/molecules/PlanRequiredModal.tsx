"use client"

import { AlertCircle, X } from "lucide-react"

interface PlanRequiredModalProps {
  isOpen: boolean
  onRegisterPlan: () => void
  onClose: () => void
}

export function PlanRequiredModal({ isOpen, onRegisterPlan, onClose }: PlanRequiredModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto border-2 border-yellow-200">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">プラン未契約</h3>
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
            クーポンを使用するには、プランの登録が必要です。
          </p>

          {/* ボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRegisterPlan}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              プランを登録する
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

