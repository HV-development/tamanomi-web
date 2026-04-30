"use client"

import { useMemo, useEffect, useState } from "react"
import Image from "next/image"
import { Ticket, X, Clock } from "lucide-react"
import type { Coupon } from "@/types/coupon"
import { calculateAge } from "@/utils/age-calculator"
import { getDefaultCouponImage } from "@/utils/coupon-image"

interface CouponListPopupProps {
  isOpen: boolean
  storeName: string
  coupons: Coupon[]
  onClose: () => void
  onBack: () => void
  onUseCoupon: (couponId: string) => void
  onUsageGuideClick: () => void
  userBirthDate?: string | null
  isUsedToday?: boolean
  isCheckingUsage?: boolean
  couponUsageStart?: string | null
  couponUsageEnd?: string | null
  couponUsageDays?: string | null
}

export function CouponListPopup({ isOpen, storeName, coupons, onClose, onUseCoupon, onUsageGuideClick, userBirthDate, isUsedToday, isCheckingUsage = false, couponUsageStart, couponUsageEnd, couponUsageDays }: CouponListPopupProps) {
  // 各クーポンの画像エラー状態を管理
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // 生年月日から年齢をリアルタイムで計算
  const userAge = useMemo(() => {
    if (!userBirthDate) return null
    try {
      return calculateAge(userBirthDate)
    } catch {
      return null
    }
  }, [userBirthDate])

  // フィルタリングされたクーポンリスト
  const filteredCoupons = useMemo(() => {
    let filtered = coupons

    // 年齢制限：20歳未満の場合、アルコールクーポンを非表示
    if (userAge !== null && userAge < 20) {
      filtered = filtered.filter(coupon => coupon.drinkType !== "alcohol")
    }

    return filtered
  }, [coupons, userAge])

  useEffect(() => {
    if (!isOpen) return
  }, [coupons, isOpen])

  const handleImageError = (couponId: string) => {
    setImageErrors(prev => ({ ...prev, [couponId]: true }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold">クーポン一覧</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 店舗名 */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex-shrink-0">
            <div className="text-center">
              <h4 className="text-lg font-bold text-green-900">{storeName}</h4>
              {/* 時間・曜日限定クーポン情報 */}
              {((couponUsageStart && couponUsageEnd) || (couponUsageDays && couponUsageDays.length > 0)) && (
                <div className="mt-2 flex items-center justify-center gap-2 text-green-700 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {couponUsageStart && couponUsageEnd ? '時間限定クーポン' : '曜日限定クーポン'}
                  </span>
                  {couponUsageDays && couponUsageDays.length > 0 && (
                    <span>{couponUsageDays.split(',').filter(Boolean).map(d => d.trim()).join(' ')}</span>
                  )}
                  {couponUsageStart && couponUsageEnd && (
                    <span>{couponUsageStart}〜{couponUsageEnd}</span>
                  )}
                </div>
              )}
              {/* 使用済みメッセージ */}
              {isUsedToday && (
                <p className="text-red-600 font-bold text-base mt-2">
                  本日のクーポンは使用済みです
                </p>
              )}
              <button
                onClick={onUsageGuideClick}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium underline transition-colors"
              >
                使用方法、注意事項についてはこちら
              </button>
            </div>
          </div>

          {/* 使用方法リンク */}
          {/* クーポンリスト */}
          <div className="flex-1 overflow-y-auto p-4 bg-transparent">
            {isCheckingUsage ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <div className="text-gray-500 text-lg font-medium">読み込み中...</div>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg font-medium mb-2">クーポンがありません</div>
                <div className="text-gray-400 text-sm">現在利用可能なクーポンはありません</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCoupons.map((coupon) => {
                  const hasImage = Boolean(coupon.imageUrl)
                  const isImageError = imageErrors[coupon.id] || false
                  const defaultImage = getDefaultCouponImage(coupon.drinkType)
                  const displayImage = hasImage && !isImageError ? coupon.imageUrl! : defaultImage
                  const shouldShowPlaceholder = !displayImage

                  return (
                    <div
                      key={coupon.id}
                      className={`bg-white rounded-2xl border-2 shadow-sm transition-shadow overflow-hidden ${isUsedToday ? 'opacity-50 border-gray-300' : 'border-gray-200 hover:shadow-md'}`}
                    >
                      {/* クーポン画像 */}
                      {shouldShowPlaceholder ? (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center border border-gray-300">
                          <span className="text-black text-sm">no image</span>
                        </div>
                      ) : (
                        <div className="w-full h-48 overflow-hidden relative">
                          <Image
                            src={displayImage!}
                            alt={coupon.name}
                            fill
                            className="object-cover object-center"
                            onError={() => handleImageError(coupon.id)}
                          />
                        </div>
                      )}

                      {/* クーポン情報 */}
                      <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2 text-left break-all">
                          {coupon.name}
                        </h4>
                        <p className="text-base text-gray-900 leading-relaxed mb-4 text-left font-medium break-all">
                          {coupon.description}
                        </p>

                        {/* 利用条件 */}
                        {coupon.conditions && (
                          <div className="mb-4 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-900 text-left font-medium break-all">
                              利用条件：{coupon.conditions}
                            </p>
                          </div>
                        )}

                        {/* 利用ボタン */}
                        <button
                          onClick={() => onUseCoupon(coupon.id)}
                          disabled={isUsedToday}
                          className={`w-full text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 shadow-md ${isUsedToday
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-[1.02]'
                            }`}
                        >
                          このクーポンで乾杯！
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}