"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Coupon } from "@/types/coupon"
import { getDefaultCouponImage } from "@/utils/coupon-image"

interface CouponCardProps {
  coupon: Coupon
  onUse: (couponId: string) => void
  className?: string
}

export function CouponCard({ coupon, onUse, className = "" }: CouponCardProps) {
  const [isImageError, setIsImageError] = useState(false)
  const formatExpiryDate = (date: Date) => {
    return format(date, "yyyy年M月d日", { locale: ja })
  }

  const hasImage = Boolean(coupon.imageUrl)
  const defaultImage = getDefaultCouponImage(coupon.drinkType)
  const displayImage = hasImage && !isImageError ? coupon.imageUrl! : defaultImage
  const shouldShowPlaceholder = !displayImage

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-green-200 hover:border-green-300 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* クーポン画像 */}
      {shouldShowPlaceholder ? (
        <div className="relative h-48 bg-gray-200 flex items-center justify-center border border-gray-300">
          <span className="text-black text-sm">no image</span>
        </div>
      ) : (
        <div className="relative h-48 overflow-hidden">
          <Image 
            src={displayImage!} 
            alt={coupon.name} 
            fill 
            className="object-cover object-center" 
            onError={() => setIsImageError(true)}
          />
        </div>
      )}

      {/* クーポン情報 */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">{coupon.name}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{coupon.description}</p>
        </div>

        {/* 有効期限 */}
        {coupon.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>有効期限: {formatExpiryDate(coupon.expiresAt)}</span>
          </div>
        )}

        {/* 使用ボタン */}
        <button
          onClick={() => onUse(coupon.id)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          クーポンを利用する
        </button>
      </div>
    </div>
  )
}
