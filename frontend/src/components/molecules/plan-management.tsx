"use client"

import { Crown, Settings } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Plan } from "../../types/user"

interface PlanManagementProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  className?: string
}

export function PlanManagement({ plan, onChangePlan, className = "" }: PlanManagementProps) {
  const formatDate = (date: Date) => {
    return format(date, "yyyy年M月d日", { locale: ja })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* メインカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-6">
        {/* タイトル */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">プランの変更</h2>
        </div>

        {/* 現在のプランセクション */}
        <div className="bg-white rounded-2xl border-2 border-green-300 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">現在のプラン</h3>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">サブスクリプション詳細</div>

          {/* プラン詳細 */}
          <div className="bg-green-100 rounded-xl p-4">
            <div className="text-center mb-3">
              <h4 className="text-lg font-bold text-green-900">{plan.name}</h4>
              <div className="text-2xl font-bold text-green-900">¥{plan.price.toLocaleString()}</div>
            </div>
            
            <div className="text-sm text-green-800 text-center mb-4">
              {plan.description}
            </div>

            <div className="space-y-2 text-sm text-green-800">
              <div>開始日：{formatDate(plan.startDate)}</div>
              {plan.nextBillingDate && (
                <div>次回請求日：{formatDate(plan.nextBillingDate)}</div>
              )}
            </div>
          </div>
        </div>

        {/* プラン変更セクション */}
        <div className="bg-white rounded-2xl border-2 border-green-300 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">プランの変更</h3>
          </div>

          <div className="text-sm text-gray-700 mb-4">
            他のプランに変更したり、機能を比較できます
          </div>

          <button
            onClick={onChangePlan}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            変更する
          </button>
        </div>
      </div>
    </div>
  )
}