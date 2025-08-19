"use client"

import { MapPin, Calendar, Ticket, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { UsageHistory } from "../../types/user"

interface UsageHistoryCardProps {
  usage: UsageHistory
  onShowOnMap: (storeId: string) => void
  onUseSameCoupon: (couponId: string) => void
  className?: string
}

export function UsageHistoryCard({ usage, onShowOnMap, onUseSameCoupon, className = "" }: UsageHistoryCardProps) {
  const formatDate = (date: Date) => {
    return format(date, "yyyy年M月d日 HH:mm", { locale: ja })
  }

  const formatUsageId = (usageId: string) => {
    return `#${usageId.toUpperCase()}`
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {formatUsageId(usage.usageId)}
            </span>
            <span className="text-xs text-gray-400">利用ID</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{usage.storeName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(usage.usedAt)}</span>
          </div>
        </div>
      </div>

      {/* 店舗情報（クリック可能） */}
      <button
        onClick={() => onShowOnMap(usage.storeId)}
        className="w-full bg-gray-50 hover:bg-blue-50 rounded-xl p-4 mb-4 transition-colors border border-gray-200 hover:border-blue-300"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-600 hover:text-blue-600 mt-0.5 flex-shrink-0 transition-colors" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 mb-1">店舗住所</div>
            <div className="text-sm text-gray-600">{usage.storeAddress}</div>
            <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              クリックしてマップで表示
            </div>
          </div>
        </div>
      </button>

      {/* クーポン情報 */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-1">利用クーポン</div>
            <div className="font-bold text-green-900 mb-1">{usage.couponName}</div>
            <div className="text-sm text-green-700">{usage.couponType}</div>
            {usage.couponDescription && (
              <div className="text-xs text-gray-600 mt-2 bg-white/60 rounded-lg p-2">{usage.couponDescription}</div>
            )}
          </div>
        </div>
      </div>

      {/* クーポン利用ボタン */}
      <div>
        <button
          onClick={() => onUseSameCoupon(usage.couponId)}
          disabled={!usage.isAvailable}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-medium ${
            usage.isAvailable
              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{usage.isAvailable ? "同じクーポンを利用" : "利用不可"}</span>
        </button>

        {/* 利用不可の理由 */}
        {!usage.isAvailable && (
          <div className="mt-2 text-xs text-gray-500 text-center">このクーポンは現在ご利用いただけません</div>
        )}
      </div>
    </div>
  )
}
