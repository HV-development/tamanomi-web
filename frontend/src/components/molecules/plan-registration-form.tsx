"use client"

import { Crown, CreditCard, Check, Calendar } from "lucide-react"
import { useState } from "react"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"

interface PlanOption {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  badge?: string
  isRecommended?: boolean
  originalPrice?: string
}

const AVAILABLE_PLANS: PlanOption[] = [
  {
    id: "3days",
    name: "3daysプラン",
    price: 300,
    description: "短期間でTAMAYOIを体験できるお試しプラン",
    features: ["1日1杯お酒が無料", "3日目の0時まで有効", "気軽にお試し可能"],
  },
  {
    id: "monthly",
    name: "マンスリープラン",
    price: 980,
    description: "毎日お得にお酒を楽しめる定番プラン",
    features: ["1日1杯お酒が無料", "さいたま市内の加盟店で利用可能", "いつでもキャンセル可能"],
    badge: "人気No.1",
    isRecommended: true,
  },
  {
    id: "premium",
    name: "プレミアムプラン",
    price: 1980,
    description: "より充実したサービスを楽しめる上位プラン",
    features: [
      "1日2杯お酒が無料",
      "プレミアム店舗も利用可能",
      "優先予約サービス",
      "限定イベント参加権",
      "専用サポート",
    ],
    badge: "NEW",
    originalPrice: "¥2,480",
  },
]

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PlanRegistrationForm({ 
  onPaymentMethodRegister, 
  onCancel, 
  isLoading = false 
}: PlanRegistrationFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly") // デフォルトで人気プランを選択

  const selectedPlanData = AVAILABLE_PLANS.find(plan => plan.id === selectedPlan)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handlePaymentRegister = () => {
    if (selectedPlan) {
      onPaymentMethodRegister(selectedPlan)
    }
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">プラン登録</h2>
        <p className="text-gray-600">ご希望のプランを選択してください</p>
      </div>

      {/* プラン選択 */}
      <div className="space-y-4">
        {AVAILABLE_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            title={plan.name}
            description={plan.description}
            features={plan.features}
            price={`¥${plan.price.toLocaleString()}/月`}
            originalPrice={plan.originalPrice}
            badge={plan.badge}
            isSelected={selectedPlan === plan.id}
            onSelect={() => handlePlanSelect(plan.id)}
          />
        ))}
      </div>

      {/* 選択されたプランの詳細表示 */}
      {selectedPlanData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">選択中のプラン</h3>
          </div>
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold text-blue-900">{selectedPlanData.name}</h4>
            <div className="text-2xl font-bold text-blue-600">¥{selectedPlanData.price.toLocaleString()}</div>
            <div className="text-sm text-blue-700 mt-1">
              {selectedPlanData.id === "3days" ? "3日間" : "月額料金"}（税込）
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h4 className="text-blue-900 font-bold">ご利用について</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 初回請求は登録完了後に行われます</li>
          <li>• プランはいつでも変更・キャンセル可能です</li>
          <li>• 決済は安全なシステムで処理されます</li>
          <li>• ご不明な点はお問い合わせください</li>
        </ul>
      </div>

      {/* 支払い方法登録ボタン */}
      <div className="space-y-3">
        <Button
          onClick={handlePaymentRegister}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? "処理中..." : "支払い方法を登録する"}
        </Button>

        <Button 
          onClick={onCancel} 
          variant="secondary" 
          className="w-full py-3 text-base font-medium"
        >
          キャンセル
        </Button>
      </div>

      {/* 注意事項 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>※ 支払い方法の登録にはイオンレジのシステムを使用します</p>
        <p>※ 登録情報は暗号化されて安全に保護されます</p>
      </div>
    </div>
  )
}