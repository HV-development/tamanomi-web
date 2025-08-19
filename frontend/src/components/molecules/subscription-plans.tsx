"use client"

import { useState } from "react"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"

interface SubscriptionPlansProps {
  onSubscribe: (planId: string) => void
  isLoading?: boolean
}

export function SubscriptionPlans({ onSubscribe, isLoading = false }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const plans = [
    {
      id: "monthly",
      title: "マンスリープラン",
      description: "毎日お得にお酒を楽しめる定番プラン",
      features: ["1日1杯お酒が無料", "さいたま市内の加盟店で利用可能", "いつでもキャンセル可能"],
      price: "月額980円",
      badge: "最初の1ヶ月無料",
    },
    {
      id: "3days",
      title: "3daysプラン",
      description: "短期間でTAMAYOIを体験できるお試しプラン",
      features: ["1日1杯お酒が無料", "3日目の0時まで有効", "気軽にお試し可能"],
      price: "300円",
    },
  ]

  const handleSubscribe = () => {
    if (selectedPlan) {
      onSubscribe(selectedPlan)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">プランを選択してください</h2>
        <p className="text-gray-600">TAMAYOIでさいたまの夜をもっと楽しく</p>
      </div>

      {/* プラン選択 */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            title={plan.title}
            description={plan.description}
            features={plan.features}
            price={plan.price}
            badge={plan.badge}
            isSelected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>

      {/* 登録ボタン */}
      <div className="space-y-3">
        <Button
          onClick={handleSubscribe}
          disabled={!selectedPlan || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium"
        >
          {isLoading ? "登録中..." : "プランに登録する"}
        </Button>
      </div>

      {/* 注意事項 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>※ 決済は安全なシステムで処理されます</p>
        <p>※ プランはいつでも変更・キャンセル可能です</p>
      </div>
    </div>
  )
}
