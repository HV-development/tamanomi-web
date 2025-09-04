"use client"

import React from 'react'

import { useCouponAudio } from "../../hooks/use-audio"

interface CouponConfirmationPageProps {
  coupon: Coupon | null
  onConfirm: () => void
  onCancel: () => void
  onUsageGuideClick: () => void
}

export default function CouponConfirmationPage({ 
  coupon, 
  onConfirm, 
  onCancel,
  onUsageGuideClick
}: CouponConfirmationPageProps) {
  if (!coupon) return null

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-center items-center p-4"
    >
      <div className="w-full max-w-xs mx-auto">
        {/* 店員への指示 */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">店員の方に画面をお見せください</h2>
          <p className="text-red-600 font-medium text-sm mt-2">
            自分では押さないでください
          </p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-green-600 p-3 text-white">
            <div className="flex items-center justify-center">
              <h3 className="text-lg font-bold text-white">クーポン使用確認</h3>
            </div>
          </div>

          {/* クーポン内容 */}
          <div className="p-6">
            {/* クーポンカード */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 mb-6 overflow-hidden max-w-fit mx-auto">
              {/* クーポン画像 */}
              <div className="w-full h-32 overflow-hidden">
                <img
                  src={coupon.imageUrl || "/placeholder.svg"}
                  alt={coupon.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* クーポン情報 */}
              <div className="p-4">
                {/* クーポン名 */}
                <div className="text-center mb-2">
                  <h4 className="font-bold text-lg text-gray-900">
                    {coupon.name}
                  </h4>
                </div>

                {/* クーポン説明 */}
                <div className="text-center">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {coupon.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            {/* ボタン */}
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
              >
                承認する
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-base transition-colors border border-gray-300"
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