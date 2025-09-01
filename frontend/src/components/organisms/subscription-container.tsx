"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { SubscriptionPlans } from "../molecules/subscription-plans"

interface SubscriptionContainerProps {
  onSubscribe: (planId: string) => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function SubscriptionContainer({ onSubscribe, onLogoClick, isLoading }: SubscriptionContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={onLogoClick} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 成功メッセージ */}
            <div className="text-center mb-8">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                🎉 登録完了おめでとうございます！
              </div>
            </div>

            {/* サブスクリプションプラン */}
            <SubscriptionPlans onSubscribe={onSubscribe} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
