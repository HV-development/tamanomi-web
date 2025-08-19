"use client"

import { Crown, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { StatusBadge } from "../atoms/status-badge"
import type { Plan } from "../../types/user"

interface PlanSectionProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  className?: string
}

export function PlanSection({ plan, onChangePlan, onCancelSubscription, className = "" }: PlanSectionProps) {
  const formatDate = (date: Date) => {
    return format(date, "yyyy年M月d日", { locale: ja })
  }

  return (
    <div className={`bg-white rounded-2xl border border-green-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">現在のプラン</h2>
            <p className="text-sm text-gray-600">サブスクリプション情報</p>
          </div>
        </div>
        <StatusBadge status={plan.isActive ? "active" : "inactive"} text={plan.isActive ? "利用中" : "停止中"} />
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-green-900">{plan.name}</h3>
            <div className="text-2xl font-bold text-green-600">¥{plan.price.toLocaleString()}</div>
          </div>
          <p className="text-green-700 text-sm mb-3">{plan.description}</p>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <Calendar className="w-4 h-4" />
            <span>開始日: {formatDate(plan.startDate)}</span>
          </div>

          {plan.nextBillingDate && (
            <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
              <Calendar className="w-4 h-4" />
              <span>次回請求日: {formatDate(plan.nextBillingDate)}</span>
            </div>
          )}
        </div>

        <button
          onClick={onChangePlan}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          プランを変更する
        </button>

        <button
          onClick={onCancelSubscription}
          className="w-full py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          サブスクリプションをキャンセル
        </button>
      </div>
    </div>
  )
}
