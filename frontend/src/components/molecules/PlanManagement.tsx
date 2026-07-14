"use client"

import { Crown, Settings } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Plan } from "../../types/user"

export interface PlanManagementCampaignInfo {
  freeDaysApplied: number
  firstBillingDate: string
  appliedAt: string
}

interface PlanManagementProps {
  plan: Plan
  onChangePlan: () => void
  onCancelSubscription: () => void
  onChangePaymentMethod?: () => void
  hasPaymentMethod?: boolean
  className?: string
  campaignInfo?: PlanManagementCampaignInfo | null
}

function formatJstYmd(iso: string): string {
  const d = new Date(iso)
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000 - d.getTimezoneOffset() * 60 * 1000)
  return `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日`
}

function computeFreePeriodEnd(iso: string): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() - 1)
  return formatJstYmd(d.toISOString())
}

export function PlanManagement({ plan, onChangePlan, onChangePaymentMethod, hasPaymentMethod: _hasPaymentMethod, className = "", campaignInfo }: PlanManagementProps) {
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
          {campaignInfo ? (
            <div className="bg-green-100 rounded-xl p-4 space-y-4">
              <div className="flex flex-col items-center gap-2">
                <h4 className="text-lg font-bold text-green-900">{plan.name}</h4>
                <span className="rounded-full bg-[#4ca154] px-3 py-1 text-[10px] font-semibold text-white">
                  キャンペーン適用中
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-semibold text-gray-500 line-through">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold text-[#4ca154]">¥0</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-2 text-xs text-green-900">
                  <div>無料期間：{formatJstYmd(campaignInfo.appliedAt)}〜{computeFreePeriodEnd(campaignInfo.firstBillingDate)}</div>
                  <div>初回決済日：{formatJstYmd(campaignInfo.firstBillingDate)}</div>
                </div>
                <p className="text-[8px] leading-relaxed text-gray-600">
                  ※ プランを変更しても無料期間は継続します。<br />
                  　初回決済日から、変更後プランの金額で継続課金を開始します
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-100 rounded-xl p-4">
              <div className="text-center mb-3">
                <h4 className="text-lg font-bold text-green-900">{plan.name}</h4>
                <div className="text-2xl font-bold text-green-900">¥{(plan.discountPrice ?? plan.price).toLocaleString()}</div>
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
          )}
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
          {onChangePaymentMethod && (
            <button
              onClick={onChangePaymentMethod}
              className="w-full mt-3 bg-white border-2 border-green-300 hover:bg-green-50 text-green-700 py-3 px-4 rounded-xl font-medium transition-colors"
            >
              支払方法の変更
            </button>
          )}
        </div>
      </div>
    </div>
  )
}