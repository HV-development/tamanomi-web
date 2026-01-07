"use client"

import { CheckCircle, X, User, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

interface ProfileUpdateSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  updatedFields?: string[]
}

export function ProfileUpdateSuccessModal({ isOpen, onClose, updatedFields = [] }: ProfileUpdateSuccessModalProps) {
  const [animationPhase, setAnimationPhase] = useState<"entering" | "celebrating" | "complete">("entering")

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase("entering")

      // アニメーションの段階的実行
      const timer1 = setTimeout(() => setAnimationPhase("celebrating"), 500)
      const timer2 = setTimeout(() => setAnimationPhase("complete"), 2000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const getUpdatedFieldsText = () => {
    if (updatedFields.length === 0) return "プロフィール情報"
    if (updatedFields.length === 1) return updatedFields[0]
    if (updatedFields.length === 2) return `${updatedFields[0]}と${updatedFields[1]}`
    return `${updatedFields.slice(0, -1).join("、")}、${updatedFields[updatedFields.length - 1]}`
  }

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]" style={{ zIndex: 10000 }}></div>

      {/* モーダル */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border-4 border-green-400 animate-in zoom-in-95 duration-500 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"></div>

            {/* アニメーション要素 */}
            {animationPhase === "celebrating" && (
              <>
                <div className="absolute top-2 right-2 animate-spin">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="absolute top-4 left-4 animate-bounce">
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                </div>
                <div className="absolute bottom-4 right-8 animate-pulse">
                  <Sparkles className="w-5 h-5 text-yellow-100" />
                </div>
              </>
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-white/20 rounded-full ${animationPhase === "celebrating" ? "animate-bounce" : ""}`}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">更新完了！</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={animationPhase !== "complete"}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-center">
                <div className="text-white/90 text-sm font-medium">プロフィールが正常に更新されました</div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="p-6 text-center">
            {/* プロフィールアイコンアニメーション */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* プロフィールアイコン */}
                <div
                  className={`w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center border-4 border-green-300 transition-all duration-1000 ${
                    animationPhase === "celebrating"
                      ? "scale-110 rotate-12"
                      : animationPhase === "complete"
                        ? "scale-100 rotate-0"
                        : "scale-90"
                  }`}
                >
                  <User className="w-10 h-10 text-green-600" />
                </div>

                {/* 更新エフェクト */}
                {animationPhase === "celebrating" && (
                  <>
                    <div className="absolute -top-2 -right-2 animate-ping">
                      <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-1 -left-1 animate-bounce">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </>
                )}

                {/* 完了エフェクト */}
                {animationPhase === "complete" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-2xl animate-pulse">✨</div>
                  </div>
                )}
              </div>
            </div>

            {/* メッセージ */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-green-900 mb-2">
                {animationPhase === "entering" && "更新処理中..."}
                {animationPhase === "celebrating" && "更新中です！"}
                {animationPhase === "complete" && "更新が完了しました！"}
              </h4>

              {animationPhase === "complete" && (
                <div className="space-y-3">
                  <p className="text-green-700 font-medium">{getUpdatedFieldsText()}を更新しました</p>

                  {/* 更新された項目の詳細 */}
                  {updatedFields.length > 0 && (
                    <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                      <h5 className="text-sm font-bold text-green-800 mb-2">更新された項目</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {updatedFields.map((field, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>{field}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      🎉 変更内容が正常に保存されました！
                      <br />
                      引き続きTAMAYOIをお楽しみください
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
                    animationPhase === "entering" ? "w-1/3" : animationPhase === "celebrating" ? "w-2/3" : "w-full"
                  }`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {animationPhase === "entering" && "プロフィールを更新中..."}
                {animationPhase === "celebrating" && "もうすぐ完了します..."}
                {animationPhase === "complete" && "更新完了！"}
              </div>
            </div>

            {/* 閉じるボタン */}
            {animationPhase === "complete" && (
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl animate-in slide-in-from-bottom-4"
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
