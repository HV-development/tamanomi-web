"use client"

import Image from "next/image"
import { Ticket, X } from "lucide-react"
import type { Coupon } from "../../types/coupon"

interface CouponListPopupProps {
  isOpen: boolean
  storeName: string
  coupons: Coupon[]
  onClose: () => void
  onBack: () => void
  onUseCoupon: (couponId: string) => void
 onUsageGuideClick: () => void
}

export function CouponListPopup({ isOpen, storeName, coupons, onClose, onUseCoupon, onUsageGuideClick }: CouponListPopupProps) {
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
                    className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* クーポン画像 */}
                    <div className="w-full h-48 overflow-hidden relative">
                      <Image
                        src={coupon.imageUrl || "/placeholder.svg"}
                        alt={coupon.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    
                    {/* クーポン情報 */}
                    <div className="p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 text-center">
                        {coupon.name}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 text-center">
                        {coupon.description}
                      </p>
                      
                      {/* 利用条件 */}
                      <div className="mb-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          利用条件：焼き鳥2本以上のご注文
                        </p>
                      </div>
                      
                      {/* 利用ボタン */}
                      <button
                        onClick={() => onUseCoupon(coupon.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        このクーポンで乾杯！
                      </button>
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