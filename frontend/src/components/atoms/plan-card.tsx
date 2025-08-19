"use client"

import { Check } from "lucide-react"

interface PlanCardProps {
  title: string
  description: string
  features: string[]
  price?: string
  originalPrice?: string
  badge?: string
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean // 追加
  className?: string
}

export function PlanCard({
  title,
  description,
  features,
  price,
  originalPrice,
  badge,
  isSelected,
  onSelect,
  disabled = false, // 追加
  className = "",
}: PlanCardProps) {
  return (
    <div
      onClick={disabled ? undefined : onSelect} // 修正
      className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
        disabled
          ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60" // グレーアウトスタイル
          : isSelected
            ? "border-green-500 bg-green-50 shadow-lg cursor-pointer"
            : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md cursor-pointer"
      } ${className}`}
    >
      {/* バッジ */}
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              disabled
                ? "bg-gray-400 text-gray-600" // グレーアウト時のバッジ
                : "bg-green-600 text-white"
            }`}
          >
            {badge}
          </span>
        </div>
      )}

      {/* 選択状態のチェックマーク */}
      {isSelected && !disabled && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* プラン名 */}
      <h3 className={`text-xl font-bold mb-2 ${disabled ? "text-gray-500" : "text-gray-900"}`}>{title}</h3>

      {/* 価格 */}
      {price && (
        <div className="mb-4">
          {originalPrice && (
            <span className={`text-sm line-through mr-2 ${disabled ? "text-gray-400" : "text-gray-500"}`}>
              {originalPrice}
            </span>
          )}
          <span className={`text-2xl font-bold ${disabled ? "text-gray-500" : "text-green-600"}`}>{price}</span>
        </div>
      )}

      {/* 説明 */}
      <p className={`mb-4 ${disabled ? "text-gray-500" : "text-gray-600"}`}>{description}</p>

      {/* 特徴リスト */}
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${disabled ? "text-gray-400" : "text-green-600"}`} />
            <span className={`text-sm ${disabled ? "text-gray-500" : "text-gray-700"}`}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
