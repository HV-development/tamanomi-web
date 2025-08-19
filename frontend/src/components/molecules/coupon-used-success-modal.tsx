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
  const [animationPhase, setAnimationPhase] = useState<"filling" | "drinking" | "empty" | "complete">("filling")

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase("filling")

      // アニメーションの段階的実行
      const timer1 = setTimeout(() => setAnimationPhase("drinking"), 500)
      const timer2 = setTimeout(() => setAnimationPhase("empty"), 2500)
      const timer3 = setTimeout(() => setAnimationPhase("complete"), 3500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isOpen])

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
            <div className="absolute top-2 right-2 animate-spin">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full animate-bounce">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">クーポン使用完了！</h3>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white/90 text-sm font-medium">お疲れさまでした！</div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="p-6 text-center">
            {/* ドリンクアニメーション */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* グラス */}
                <div className="w-24 h-32 relative">
                  {/* グラスの外枠 */}
                  <div className="absolute inset-0 border-4 border-gray-300 rounded-b-3xl bg-transparent"></div>

                  {/* ドリンク */}
                  <div
                    className={`absolute bottom-1 left-1 right-1 bg-gradient-to-t from-amber-400 to-amber-200 rounded-b-3xl transition-all duration-2000 ease-in-out ${
                      animationPhase === "filling"
                        ? "h-28"
                        : animationPhase === "drinking"
                          ? "h-14"
                          : animationPhase === "empty"
                            ? "h-0"
                            : "h-0"
                    }`}
                  ></div>

                  {/* 泡エフェクト */}
                  {animationPhase === "filling" && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  )}

                  {/* グラスのハイライト */}
                  <div className="absolute top-2 left-2 w-1 h-8 bg-white/30 rounded-full"></div>
                </div>

                {/* 飲んでいるエフェクト */}
                {animationPhase === "drinking" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-2xl animate-bounce">🍻</div>
                  </div>
                )}

                {/* 完了エフェクト */}
                {animationPhase === "complete" && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="text-3xl animate-pulse">✨</div>
                  </div>
                )}
              </div>
            </div>

            {/* メッセージ */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-green-900 mb-2">
                {animationPhase === "filling" && "ドリンクを準備中..."}
                {animationPhase === "drinking" && "美味しくいただいています！"}
                {animationPhase === "empty" && "ごちそうさまでした！"}
                {animationPhase === "complete" && "クーポンを使用しました！"}
              </h4>

              {animationPhase === "complete" && (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">{coupon.name}</p>
                  <p className="text-sm text-gray-600">{coupon.storeName}</p>
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 ありがとうございました！
                      <br />
                      またのご利用をお待ちしております
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* プログレスバー */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ${
                    animationPhase === "filling"
                      ? "w-1/4"
                      : animationPhase === "drinking"
                        ? "w-2/3"
                        : animationPhase === "empty"
                          ? "w-5/6"
                          : "w-full"
                  }`}
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