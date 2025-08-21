"use client"

import { ArrowLeft } from "lucide-react"
import { Logo } from "../atoms/logo"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-center p-3">
      <div className="w-full max-w-xs mx-auto">
        {/* 店員への指示 */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold text-gray-900">店員の方に画面をお見せください</h2>
        </div>

        {/* クーポン使用確認カード */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-green-400 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-green-600 p-3 text-white text-center">
            <h3 className="text-lg font-bold">クーポン使用確認</h3>
          </div>

          {/* 店舗名 */}
          <div className="bg-green-50 p-3 text-center border-b border-green-200">
            <h4 className="text-base font-bold text-green-900">{coupon.storeName}</h4>
          </div>

          {/* クーポン情報 */}
          <div className="p-4">
            {/* クーポン画像 */}
            <div className="w-full h-32 overflow-hidden rounded-xl mb-4">
              <img
                src={coupon.imageUrl || "/placeholder.svg"}
                alt={coupon.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* クーポン詳細 */}
            <div className="text-center mb-4">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {coupon.name}
              </h4>
              <p className="text-sm text-gray-900 leading-relaxed">
                {coupon.description}
              </p>
            </div>

            {/* リンクセクション */}
            <div className="space-y-2 mb-4">
              <button className="w-full text-blue-600 hover:text-blue-700 text-xs font-medium underline transition-colors">
                使用方法についてはこちら
              </button>
              <button className="w-full text-red-600 hover:text-red-700 text-xs font-medium underline transition-colors">
                注意事項についてはこちら
              </button>
            </div>

            {/* ボタン */}
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold text-base transition-colors shadow-md hover:shadow-lg"
              >
                確定する
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors border border-gray-300"
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