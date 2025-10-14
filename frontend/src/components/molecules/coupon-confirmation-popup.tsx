"use client"

import Image from "next/image"
import { useCouponAudio } from "../../hooks/use-audio"
import type { Coupon } from "../../types/coupon"

interface CouponConfirmationPopupProps {
  isOpen: boolean
  coupon: Coupon | null
  onConfirm: () => void
  onCancel?: () => void
}

export function CouponConfirmationPopup({ isOpen, coupon, onConfirm, onCancel }: CouponConfirmationPopupProps) {

  const { playCouponSound } = useCouponAudio()

  if (!isOpen || !coupon) return null

  const handleConfirm = () => {
    // クーポン使用音を再生
    playCouponSound()
    // 既存の処理を実行
    onConfirm()
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
        onClick={onCancel || (() => { })}
        style={{ zIndex: 9999 }}
      ></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 z-[9999] max-w-md mx-auto" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-3xl shadow-2xl h-full border-4 border-green-400 flex flex-col overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0">
            <div className="text-center">
              <h3 className="text-xl font-bold">クーポン使用確認</h3>
            </div>
          </div>

          {/* サブヘッダー */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex-shrink-0">
            <div className="text-center">
              <div className="text-green-800 font-medium">店員の方に画面をお見せください</div>
            </div>
          </div>

          {/* スクロール可能なコンテンツ部分 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* クーポン情報カード */}
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 relative w-20 h-20">
                    <Image
                      src={coupon.imageUrl || "/placeholder.svg"}
                      alt={coupon.name}
                      fill
                      className="rounded-xl object-cover border border-gray-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{coupon.name}</h4>
                    <p className="text-sm text-gray-600">{coupon.storeName}</p>
                  </div>
                </div>
              </div>

              {/* 使用方法について */}
              <div className="mb-6">
                <h5 className="font-semibold text-gray-900 mb-3">使用方法</h5>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. 店員の方にこの画面をお見せください</p>
                  <p>2. 店員の方が確認後、クーポンを使用してください</p>
                  <p>3. 使用後は自動的にクーポンが無効になります</p>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h5 className="font-semibold text-yellow-800 mb-2">注意事項</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 他のクーポンと併用できません</li>
                  <li>• 有効期限: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ja-JP') : '未設定'}</li>
                  <li>• 使用後は取り消しできません</li>
                </ul>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onCancel || (() => { })}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                使用する
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}