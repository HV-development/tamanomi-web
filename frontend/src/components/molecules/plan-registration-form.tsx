"use client"

import { Crown, CreditCard, Check, Calendar, AlertCircle } from "lucide-react"
import { useState } from "react"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  isLoading?: boolean
  plans: PlanListResponse['plans']
  error?: string
}

export function PlanRegistrationForm({ 
  onPaymentMethodRegister, 
  onCancel, 
  isLoading = false,
  plans,
  error
}: PlanRegistrationFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans.length > 0 ? plans[0].id : "")

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan)

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

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* プラン選択 */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">利用可能なプランがありません</p>
          </div>
        ) : (
          plans.map((plan) => {
            // 割引価格がある場合は割引価格を表示、ない場合は通常価格を表示
            const displayPrice = plan.discount_price ? plan.discount_price : plan.price;
            const hasDiscount = plan.discount_price && plan.discount_price < plan.price;
            
            return (
              <PlanCard
                key={plan.id}
                title={plan.name}
                description={plan.description || ''}
                features={plan.plan_content?.features || []}
                price={`¥${displayPrice.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                originalPrice={hasDiscount ? `¥${plan.price.toLocaleString()}${plan.is_subscription ? '/月' : ''}` : undefined}
                badge={plan.status === 'active' ? '利用可能' : undefined}
                isSelected={selectedPlan === plan.id}
                onSelect={() => handlePlanSelect(plan.id)}
              />
            );
          })
        )}
      </div>

      {/* 支払い方法登録ボタン */}
      <div>
        <Button
          onClick={handlePaymentRegister}
          disabled={isLoading || plans.length === 0 || !selectedPlan}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? "処理中..." : "支払い方法を登録する"}
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