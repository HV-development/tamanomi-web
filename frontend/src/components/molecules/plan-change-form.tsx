"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"
import { AlertTriangle, Calendar, CreditCard } from "lucide-react"
import type { Plan } from "../../types/user"

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

interface PlanChangeFormProps {
  currentPlan: Plan
  onPlanChange: (planId: string) => void
  onCancel: () => void
  isLoading?: boolean
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

export function PlanChangeForm({ currentPlan, onPlanChange, onCancel, isLoading = false }: PlanChangeFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const selectedPlanData = AVAILABLE_PLANS.find((plan) => plan.id === selectedPlan)
  const isUpgrade = selectedPlanData && selectedPlanData.price > currentPlan.price
  const isDowngrade = selectedPlanData && selectedPlanData.price < currentPlan.price

  // プランリストを現在のプランを基準に並び替え
  const getSortedPlans = () => {
    const plans = [...AVAILABLE_PLANS]

    // 現在のプランのインデックスを見つける
    const currentPlanIndex = plans.findIndex((plan) => plan.id === currentPlan.id)

    if (currentPlanIndex === -1) return plans

    // 現在のプランを配列から取り出し、おすすめ位置（中央）に配置
    const currentPlanData = plans[currentPlanIndex]
    const otherPlans = plans.filter((plan) => plan.id !== currentPlan.id)

    // 価格順でソート
    const sortedOtherPlans = otherPlans.sort((a, b) => a.price - b.price)

    // 現在のプランより安いプランを前に
    const lowerPlans = sortedOtherPlans.filter((plan) => plan.price < currentPlan.price)

    // 現在のプランより高いプランを後に
    const higherPlans = sortedOtherPlans.filter((plan) => plan.price > currentPlan.price)

    // 最終的な並び順: 安いプラン → 現在のプラン → 高いプラン
    return [...lowerPlans, currentPlanData, ...higherPlans]
  }

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan.id) return // 同じプランは選択不可
    setSelectedPlan(planId)
  }

  const handleConfirm = () => {
    if (selectedPlan) {
      setShowConfirmation(true)
    }
  }

  const handleFinalConfirm = () => {
    if (selectedPlan) {
      onPlanChange(selectedPlan)
    }
  }

  const formatNextBillingDate = () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return format(nextMonth, "yyyy年M月d日", { locale: ja })
  }

  if (showConfirmation && selectedPlanData) {
    return (
      <div className="space-y-6">
        {/* 確認ヘッダー */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更の確認</h2>
          <p className="text-gray-600">以下の内容でプランを変更します</p>
        </div>

        {/* 変更内容 */}
        <div className="space-y-4">
          {/* 現在のプラン */}
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">現在のプラン</div>
              <div className="font-bold text-gray-900">{currentPlan.name}</div>
              <div className="text-sm text-gray-700">¥{currentPlan.price.toLocaleString()}/月</div>
            </div>
          </div>

          {/* 矢印 */}
          <div className="text-center">
            <div className="text-2xl text-green-600">↓</div>
          </div>

          {/* 新しいプラン */}
          <div className="p-4 bg-green-100 rounded-xl border border-green-300">
            <div className="text-center">
              <div className="text-sm text-green-700 mb-1">新しいプラン</div>
              <div className="font-bold text-green-900">{selectedPlanData.name}</div>
              <div className="text-sm text-green-800">¥{selectedPlanData.price.toLocaleString()}/月</div>
            </div>
          </div>
        </div>

        {/* 料金変更について */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="text-sm text-yellow-900 font-bold mb-3">料金変更について</div>
          <ul className="text-sm text-yellow-800 space-y-1">
            {isUpgrade && (
              <>
                <li>• プランアップグレードにより、次回請求額が変更されます</li>
                <li>• 変更は即座に適用され、追加機能をすぐにご利用いただけます</li>
                <li>• 次回請求日: {formatNextBillingDate()}</li>
              </>
            )}
            {isDowngrade && (
              <>
                <li>• プランダウングレードにより、次回請求額が変更されます</li>
                <li>• 変更は次回請求日から適用されます</li>
                <li>• 現在の請求期間中は現在のプランが継続されます</li>
              </>
            )}
          </ul>
        </div>

        {/* 請求情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="text-sm text-blue-900 font-bold mb-3">請求情報</div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 次回請求日: {formatNextBillingDate()}</li>
            <li>• 請求金額: ¥{selectedPlanData.price.toLocaleString()}</li>
            <li>• 決済方法: 登録済みのクレジットカード</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          <Button
            onClick={handleFinalConfirm}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
          >
            {isLoading ? "変更中..." : "変更する"}
          </Button>

          <Button
            onClick={() => setShowConfirmation(false)}
            variant="secondary"
            className="w-full py-3 text-base font-medium"
          >
            戻る
          </Button>
        </div>
      </div>
    )
  }

  const sortedPlans = getSortedPlans()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更</h2>
        <p className="text-gray-600">新しいプランを選択してください</p>
      </div>

      {/* プラン選択 */}
      <div className="space-y-4">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id
          const isSelected = selectedPlan === plan.id

          return (
            <div key={plan.id} className="relative">
              <PlanCard
                title={plan.name}
                description={plan.description}
                features={plan.features}
                price={`¥${plan.price.toLocaleString()}/月`}
                originalPrice={plan.originalPrice}
                badge={plan.badge}
                isSelected={isSelected}
                onSelect={() => handlePlanSelect(plan.id)}
                disabled={isCurrentPlan}
              />

              {/* 現在のプランオーバーレイ */}
              {isCurrentPlan && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none">
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold">現在ご利用中</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-bold mb-2">プラン変更について</div>
            <ul className="space-y-1">
              <li>• プラン変更はいつでも可能です</li>
              <li>• アップグレードは即座に適用されます</li>
              <li>• ダウングレードは次回請求日から適用されます</li>
              <li>• 変更後のキャンセルも可能です</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedPlan}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium disabled:bg-gray-300"
        >
          変更する
        </Button>

        <Button onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>
    </div>
  )
}