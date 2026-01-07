"use client"

import Image from "next/image"
import React, { useState } from 'react'
import type { Coupon } from '@/types/coupon'

interface CouponConfirmationPageProps {
  coupon: Coupon | null
  onConfirm: () => void
  onCancel: () => void
  currentUserRank?: string | null
}

export default function CouponConfirmationPage({
  coupon,
  onConfirm,
  onCancel,
}: CouponConfirmationPageProps) {
  // 全ての背景色をブロンズ・非会員色に統一
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"
  const [isRotated, setIsRotated] = useState(false)

  if (!coupon) return null

  const handleShowToStaff = () => {
    setIsRotated(true)
  }

  const handleUse = () => {
    onConfirm()
  }

  return (
    <div
      className={`min-h-screen ${backgroundColorClass} flex flex-col`}
    >
      {/* スタッフ向け確認画面 */}
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-xl mx-auto">
          {/* メインカード */}
          <div className={`bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden transition-transform duration-500 ${isRotated ? 'transform rotate-180' : ''}`}>
            {/* ヘッダー */}
            <div className="bg-green-600 p-4 text-white">
              <div className="flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">クーポン使用確認</h3>
              </div>
            </div>

            {/* クーポン内容 */}
            <div className="p-8">
              {/* クーポンカード */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 mb-6 overflow-hidden">
                {/* クーポン画像 */}
                <div className="w-full h-64 overflow-hidden relative">
                  <Image
                    src={coupon.imageUrl || "/placeholder.svg"}
                    alt={coupon.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                {/* クーポン情報 */}
                <div className="p-6">
                  {/* クーポン名 */}
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-2xl text-gray-900">
                      {coupon.name}
                    </h4>
                  </div>

                  {/* クーポン説明 */}
                  <div className="text-center mb-4">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {coupon.description}
                    </p>

                    {/* 利用条件 */}
                    {coupon.conditions && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          利用条件：{coupon.conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー向け利用ボタン */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="w-full max-w-xs mx-auto">
          <div className="space-y-3">
            {!isRotated ? (
              <>
                <p className="text-sm text-gray-700 text-center mb-2">
                  店員の方に画面をお見せください
                </p>
                {coupon.drinkType === 'alcohol' && (
                  <p className="text-red-600 font-medium text-sm text-center mb-2">
                    ※20歳未満の方はアルコールは飲めません
                  </p>
                )}
                <button
                  onClick={handleShowToStaff}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
                >
                  店員に見せる
                </button>
                <button
                  onClick={onCancel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-base transition-colors border border-gray-300"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUse}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
                >
                  利用する
                </button>
                <button
                  onClick={onCancel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-base transition-colors border border-gray-300"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}