"use client"

import { CheckCircle, X, Gift } from "lucide-react"
import { useEffect, useState } from "react"

interface PlanChangeSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  oldPlanName: string
  newPlanName: string
  newPlanPrice: number
  isUpgrade: boolean
}

export function PlanChangeSuccessModal({
  isOpen,
  onClose,
  oldPlanName,
  newPlanName,
  newPlanPrice,
  isUpgrade,
}: PlanChangeSuccessModalProps) {
  const [animationPhase, setAnimationPhase] = useState<"entering" | "celebrating" | "complete">("entering")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase("entering")
      setProgress(0)

      // アニメーションの段階的実行
      const timer1 = setTimeout(() => {
        setAnimationPhase("celebrating")
        setProgress(30)
      }, 500)
      
      const timer2 = setTimeout(() => {
        setProgress(60)
      }, 1200)
      
      const timer3 = setTimeout(() => {
        setProgress(90)
      }, 1800)
      
      const timer4 = setTimeout(() => {
        setAnimationPhase("complete")
        setProgress(100)
      }, 2500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]" style={{ zIndex: 10000 }}></div>

      {/* モーダル */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] border-4 border-green-400 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white relative overflow-hidden flex-shrink-0">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-white/20 rounded-full ${animationPhase === "celebrating" ? "animate-bounce" : ""}`}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">プラン変更完了！</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  disabled={animationPhase !== "complete"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <div className="text-white/90 text-sm font-medium">
                  {animationPhase === "complete" 
                    ? (isUpgrade ? "プランをアップグレードしました" : "プランを変更しました")
                    : "プラン変更処理中..."
                  }
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto p-4 text-center">
            {/* メッセージ */}
            <div className="mb-4">
              <h4 className="text-lg font-bold text-green-900 mb-2">
                {animationPhase === "entering" && "プラン変更中..."}
                {animationPhase === "celebrating" && "プラン変更中..."}
                {animationPhase === "complete" && "プラン変更完了！"}
              </h4>

              {/* 進行状況表示 */}
              {animationPhase !== "complete" && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-green-600 mb-2">{progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {progress < 30 && "プラン情報を確認中..."}
                    {progress >= 30 && progress < 60 && "決済情報を更新中..."}
                    {progress >= 60 && progress < 90 && "新しいプランを適用中..."}
                    {progress >= 90 && progress < 100 && "最終確認中..."}
                  </div>
                </div>
              )}

              {animationPhase === "complete" && (
                <div className="space-y-2">
                  {/* プラン変更詳細 */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">変更前</div>
                      <div className="font-medium text-gray-800">{oldPlanName}</div>
                      <div className="text-xl text-green-600">↓</div>
                      <div className="text-sm text-green-700">変更後</div>
                      <div className="font-bold text-green-900">{newPlanName}</div>
                      <div className="text-sm text-green-800">¥{newPlanPrice.toLocaleString()}/月</div>
                    </div>
                  </div>

                  {/* 特典メッセージ */}
                  {isUpgrade && (
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-blue-800">アップグレード特典</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        新機能が即座にご利用いただけます！
                      </p>
                    </div>
                  )}

                  <div className="p-2 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      プラン変更が正常に完了しました。
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ボタン部分 - 固定 */}
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            {/* 閉じるボタン */}
            {animationPhase === "complete" && (
              <button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors animate-in slide-in-from-bottom-4"
              >
                マイページに戻る
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
