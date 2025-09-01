"use client"

import { StoreList } from "./store-list"
import { Clock, X } from "lucide-react"
import type { Store } from "../../types/store"

interface HistoryPopupProps {
  isOpen: boolean
  stores: Store[]
  onClose: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
}

export function HistoryPopup({ isOpen, stores, onClose, onFavoriteToggle, onCouponsClick }: HistoryPopupProps) {
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
              <h4 className="text-lg font-bold text-green-900">{stores.length} 件のお気に入り</h4>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6 bg-transparent">
            <StoreList
              stores={stores}
              onFavoriteToggle={onFavoriteToggle}
              onCouponsClick={onCouponsClick}
              emptyMessage="まだ閲覧履歴がありません"
              emptyEmoji="📋"
            />
          </div>
        </div>
      </div>
    </>
  )
}