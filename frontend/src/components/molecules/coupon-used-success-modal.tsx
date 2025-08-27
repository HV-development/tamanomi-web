"use client"

import { CheckCircle, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useCouponAudio } from "../../hooks/use-audio"
import type { Coupon } from "../../types/coupon"

interface CouponUsedSuccessModalProps {
  isOpen: boolean
  coupon: Coupon | null
  onClose: () => void
}

export function CouponUsedSuccessModal({ isOpen, coupon, onClose }: CouponUsedSuccessModalProps) {
  const { playCouponSound, initializeAudio } = useCouponAudio()

  // モーダルが開いた時に音声を再生
  useEffect(() => {
    if (isOpen && coupon) {
      // 音声システムを初期化してから再生
      initializeAudio()
      
      // 少し遅延させて確実に音声を再生
      const timer = setTimeout(() => {
        playCouponSound()
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, coupon, initializeAudio, playCouponSound])

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
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* GIFファイルを使用したビールジョッキ */}
                <img 
                  src="/Beer_mug.gif" 
                  alt="ビールジョッキ" 
                  className="w-32 h-32 object-contain transform scale-[2]"
                />
              </div>
            </div>

            {/* メッセージ */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-green-900 mb-2">
                クーポンを使用しました！
              </h4>

              <div className="space-y-2">
                <p className="text-green-700 font-medium">{coupon.name}</p>
                <p className="text-sm text-gray-600">{coupon.storeName}</p>
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => {
                if (onClose) {
                  onClose()
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  )
}