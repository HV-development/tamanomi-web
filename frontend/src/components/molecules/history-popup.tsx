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
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 text-white flex-shrink-0 relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">閲覧履歴</h3>
                    <p className="text-green-100 text-sm font-medium opacity-90">最近チェックしたお店</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* カウンター */}
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex-shrink-0">
            <div className="text-center">
              <span className="text-green-800 font-medium">
                {stores.length > 0 ? `${stores.length}件の履歴` : "まだ履歴がありません"}
              </span>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
