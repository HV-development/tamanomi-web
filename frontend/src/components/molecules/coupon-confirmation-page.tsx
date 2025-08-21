"use client"

import type { Coupon } from "../../types/coupon"

interface CouponConfirmationPageProps {
  coupon: Coupon | null
  onConfirm: () => void
  onCancel: () => void
  onLogoClick: () => void
}

export function CouponConfirmationPage({ coupon, onConfirm, onCancel, onLogoClick }: CouponConfirmationPageProps) {
  if (!coupon) return null

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-[280px] mx-auto">
        {/* 店員への指示 */}
        <div className="text-center mb-3">
          <h2 className="text-xs font-bold text-gray-900">店員の方に画面をお見せください</h2>
        </div>

        {/* クーポンカード */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-green-600 p-2 text-white text-center">
            <h3 className="text-xs font-bold">クーポン使用確認</h3>
          </div>

          {/* クーポン内容 */}
          <div className="p-3">
            {/* クーポン画像 */}
            <div className="w-full h-24 overflow-hidden rounded-lg mb-2">
              <img
                src={coupon.imageUrl || "/placeholder.svg"}
                alt={coupon.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* クーポン名 */}
            <div className="text-center mb-1">
              <h4 className="font-bold text-sm text-gray-900">
                {coupon.name}
              </h4>
            </div>

            {/* クーポン説明 */}
            <div className="text-center mb-3">
              <p className="text-xs text-gray-900 leading-tight">
                {coupon.description}
              </p>
            </div>

            {/* リンクセクション */}
            <div className="space-y-1 mb-3">
              <button className="w-full text-blue-600 hover:text-blue-700 text-xs font-medium underline transition-colors">
                使用方法についてはこちら
              </button>
              <button className="w-full text-red-600 hover:text-red-700 text-xs font-medium underline transition-colors">
                注意事項についてはこちら
              </button>
            </div>

            {/* ボタン */}
            <div className="space-y-1">
              <button
                onClick={onConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-bold text-xs transition-colors shadow-md hover:shadow-lg"
              >
                確定する
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg font-medium text-xs transition-colors border border-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}