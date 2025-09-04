"use client"

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
                  <div className="flex-shrink-0">
                    <img
                      src={coupon.imageUrl || "/placeholder.svg"}
                      alt={coupon.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{coupon.name}</h4>
                    <p className="text-sm text-gray-600">{coupon.storeName}</p>
                  </div>
                </div>
              </div>

              {/* 使用方法について */}
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h5 className="font-bold text-blue-900 mb-3">使用方法について</h5>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. 店員にこの画面をお見せください</li>
                  <li>2. 店員が「確定する」ボタンを押下</li>
                  <li>3. クーポンが使用済みになります</li>
                </ol>
              </div>

              {/* 注意事項 */}
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  console.log("Confirm button clicked")
                  e.preventDefault()
                  e.stopPropagation()

                  // 音声再生を少し遅延させてコンテキストを確実に準備
                  setTimeout(() => {
                    console.log("🎵 Playing audio with delay")
                    playCouponSound()
                  }, 50)

                  // 既存の処理を実行
                  onConfirm()
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-medium transition-colors"
              >
                確定する
              </button>
              <button
                onClick={() => {
                  console.log("Cancel button clicked")
                  console.log("onCancel function:", typeof onCancel)
                  if (onCancel) {
                    console.log("Calling onCancel...")
                    onCancel()
                    console.log("onCancel called successfully")
                  }
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}