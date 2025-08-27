"use client"

import { useCouponAudio } from "../../hooks/use-audio"
import type { Coupon } from "../../types/coupon"

interface CouponConfirmationPageProps {
  coupon: Coupon | null
  onConfirm: () => void
  onCancel: () => void
  onUsageGuideClick: () => void
  onLogoClick: () => void
}

export function CouponConfirmationPage({ coupon, onConfirm, onCancel, onUsageGuideClick = () => {}, onLogoClick }: CouponConfirmationPageProps) {
  const { playCouponSound, isAudioReady } = useCouponAudio()

  if (!coupon) return null

  const handleConfirm = () => {
    console.log("🎵 handleConfirm called - starting audio playback")
    console.log("🎵 playCouponSound function:", typeof playCouponSound)
   console.log("🎵 isAudioReady:", isAudioReady)
    
    try {
      console.log("🎵 Attempting to play coupon sound...")
      // 音声を再生（ユーザーインタラクション内で直接実行）
      playCouponSound()
      console.log("🎵 playCouponSound() called successfully")
    } catch (error) {
      console.error("🎵 Error playing coupon sound:", error)
    }
    
    // 既存の処理を実行
    console.log("🎵 Calling onConfirm...")
    onConfirm()
    console.log("🎵 onConfirm called successfully")
  }

  // ユーザーインタラクションでオーディオコンテキストを初期化
  const handleUserInteraction = () => {
    console.log("🎵 User interaction detected - preparing audio context")
    if (couponSound.current && !isAudioReady) {
      console.log("🎵 Attempting to unlock audio context")
      // 無音で短時間再生してオーディオコンテキストをアンロック
      const unlockSound = couponSound.current.play()
      if (unlockSound) {
        couponSound.current.stop(unlockSound)
      }
    }
  }
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-center items-center p-4"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <div className="w-full max-w-xs mx-auto">
        {/* 店員への指示 */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">店員の方に画面をお見せください</h2>
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

            {/* リンクセクション */}
            <div className="space-y-2 mb-6">
              <button 
                onClick={onUsageGuideClick}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium underline transition-colors"
              >
                使用方法、注意事項についてはこちら
              </button>
            </div>

            {/* ボタン */}
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
              >
                確定する
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