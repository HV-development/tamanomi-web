"use client"

import { useEffect } from "react"
import { StoreList } from "./StoreList"
import { X } from "lucide-react"
import type { Store } from "@/types/store"

interface HistoryPopupProps {
  isOpen: boolean
  stores: Store[]
  onClose: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick: (store: Store) => void
}

export function HistoryPopup({ isOpen, stores, onClose, onFavoriteToggle, onCouponsClick, onStoreClick }: HistoryPopupProps) {
  // モーダルが開いている間、背後のスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold">お気に入り</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 店舗数表示 */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex-shrink-0">
            <div className="text-center">
              <h4 className="text-lg font-bold text-green-900">気になるお店{String(stores.length).replace(/[0-9]/g, (match) => String.fromCharCode(match.charCodeAt(0) + 0xFEE0))}件</h4>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain p-6 bg-transparent">
            <StoreList
              stores={stores}
              onFavoriteToggle={onFavoriteToggle}
              onCouponsClick={onCouponsClick}
              onStoreClick={onStoreClick}
              actionsLayout="vertical"
              emptyMessage="まだ閲覧履歴がありません"
              emptyEmoji="📋"
            />
          </div>
        </div>
      </div>
    </>
  )
}