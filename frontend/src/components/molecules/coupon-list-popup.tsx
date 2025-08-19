"use client"

import { ArrowLeft, Ticket, X } from "lucide-react"
import { CouponCard } from "../atoms/coupon-card"
import type { Coupon } from "../../types/coupon"

interface CouponListPopupProps {
  isOpen: boolean
  storeName: string
  coupons: Coupon[]
  onClose: () => void
  onBack: () => void
  onUseCoupon: (couponId: string) => void
}

export function CouponListPopup({ isOpen, storeName, coupons, onClose, onBack, onUseCoupon }: CouponListPopupProps) {
  if (!isOpen) return null

  console.log("CouponListPopup rendering:", { isOpen, storeName, couponsCount: coupons.length })

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
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
            </div>
          </div>

          {/* クーポンリスト */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg font-medium mb-2">クーポンがありません</div>
                <div className="text-gray-400 text-sm">現在利用可能なクーポンはありません</div>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* クーポン画像 */}
                      <div className="flex-shrink-0 flex items-center">
                        <img
                          src={coupon.imageUrl || "/placeholder.svg"}
                          alt={coupon.name}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                        />
                      </div>
                      
                      {/* クーポン情報 */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                          {coupon.name}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 flex-1 line-clamp-3">
                          {coupon.description}
                        </p>
                        
                        {/* 利用ボタン */}
                        <button
                          onClick={() => onUseCoupon(coupon.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                        >
                          利用する
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}