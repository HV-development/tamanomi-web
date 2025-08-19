"use client"

import { CheckCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import type { Coupon } from "../../types/coupon"

interface CouponUsedSuccessModalProps {
  isOpen: boolean
  coupon: Coupon | null
  onClose: () => void
}

export function CouponUsedSuccessModal({ isOpen, coupon, onClose }: CouponUsedSuccessModalProps) {
  const [animationPhase, setAnimationPhase] = useState<"filling" | "complete">("filling")

  useEffect(() => {
    if (isOpen) {
      // モーダルが開かれた時にアニメーション段階をリセット
      setAnimationPhase("filling")

      // アニメーションの段階的実行（2秒で注ぎ終わる）
      const timer = setTimeout(() => {
        setAnimationPhase("complete")
      }, 2000)

      return () => {
        clearTimeout(timer)
      }
    } else {
      // モーダルが閉じられた時にアニメーション段階をリセット
      setAnimationPhase("filling")
    }
  }, [isOpen])

  // モーダルが閉じられている場合は何も表示しない
  if (!isOpen || !coupon) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]" style={{ zIndex: 10000 }}></div>

      {/* モーダル */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border-4 border-green-400 animate-in zoom-in-95 duration-500 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"></div>
            <div className="relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold">使用完了</h3>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="p-6 text-center">
            {/* ドリンクアニメーション */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* ビールジョッキ */}
                <div className="w-36 h-48 relative">
                  {/* ジョッキの外枠 */}
                  <div className="absolute inset-0 border-4 border-amber-800 rounded-b-3xl bg-transparent"></div>
                  
                  {/* ジョッキの取っ手 */}
                  <div className="absolute right-0 top-6 w-5 h-12 border-4 border-amber-800 rounded-l-full bg-transparent"></div>
                  
                  {/* ビールの液体 */}
                  <div
                    className={`absolute bottom-2 left-2 right-2 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-b-3xl transition-all duration-2000 ease-out ${
                      animationPhase === "filling"
                        ? "h-0"
                        : "h-40"
                    }`}
                    style={{
                      transition: 'height 2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  ></div>
                  
                  {/* 泡エフェクト */}
                  {animationPhase === "filling" && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-2.5 h-2.5 bg-white/80 rounded-full animate-ping"></div>
                      <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
                    </div>
                  )}
                  
                  {/* ジョッキのハイライト */}
                  <div className="absolute top-3 left-3 w-1.5 h-10 bg-white/40 rounded-full"></div>
                  <div className="absolute top-5 right-6 w-1 h-6 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* メッセージ */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-green-900 mb-2">
                {animationPhase === "filling" && "ドリンクの到着をお待ちください。"}
                {animationPhase === "complete" && "クーポンを使用しました！"}
              </h4>

              {animationPhase === "complete" && (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">{coupon.name}</p>
                  <p className="text-sm text-gray-600">{coupon.storeName}</p>
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ドリンクの到着をお待ちください
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* プログレスバー */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-2000 ease-out ${
                    animationPhase === "filling"
                      ? "w-0"
                      : "w-full"
                  }`}
                  style={{
                    transition: 'width 2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                  }}
                ></div>
              </div>
            </div>

            {/* 閉じるボタン */}
            {animationPhase === "complete" && (
              <button
                onClick={() => {
                  console.log("Close button clicked in success modal")
                  console.log("Calling onClose handler...")
                  if (onClose) {
                    console.log("onClose function exists, calling it...")
                    onClose()
                    console.log("onClose called successfully")
                  } else {
                    console.log("onClose function is undefined!")
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}