"use client"

import { Info } from "lucide-react"

interface PlanCancelledNoticeBannerProps {
  isVisible: boolean
  onRegisterPlan: () => void
}

export function PlanCancelledNoticeBanner({ isVisible, onRegisterPlan }: PlanCancelledNoticeBannerProps) {
  if (!isVisible) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-snug">
              プランのご登録をお願いします
            </p>
            <p className="text-sm text-gray-700 leading-snug mt-1">
              ご登録のお支払いカードで決済ができなかったため、現在ご契約中のプランがございません。
              <br />
              再度プランをご登録ください。
            </p>
            <button
              onClick={onRegisterPlan}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              プランを登録する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
