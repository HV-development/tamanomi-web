"use client"

import { StoreCard } from "./StoreCard"
import type { Store } from "@/types/store"

interface StoreListProps {
  stores: Store[]
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick?: (store: Store) => void
  showDistance?: boolean
  /** 店舗カード下部のアクションボタンの並び方 */
  actionsLayout?: "horizontal" | "vertical"
  emptyMessage?: string
  emptyEmoji?: string
  className?: string
  showEmptyMessage?: boolean
  isLoading?: boolean
  /** 支払い一時停止中で「今すぐクーポンGET」を無効化するか */
  isCouponDisabled?: boolean
}

export function StoreList({
  stores,
  onFavoriteToggle,
  onCouponsClick,
  onStoreClick,
  showDistance = false,
  actionsLayout = "horizontal",
  emptyMessage = "店舗が見つかりませんでした",
  emptyEmoji = "🔍",
  className = "",
  showEmptyMessage = true,
  isLoading = false,
  isCouponDisabled = false,
}: StoreListProps) {
  // ローディング中はスピナーを表示
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <div className="text-gray-600 text-lg font-medium">読み込み中...</div>
      </div>
    )
  }
  
  if (stores.length === 0 && showEmptyMessage) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">{emptyEmoji}</div>
        <div className="text-gray-600 text-lg font-medium">{emptyMessage}</div>
        <div className="text-gray-500 text-sm mt-2">新しいお店を探してみましょう</div>
      </div>
    )
  }
  
  if (stores.length === 0) {
    return null
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onFavoriteToggle={onFavoriteToggle}
          onCouponsClick={onCouponsClick}
          onStoreClick={onStoreClick ?? (() => { })}
          showDistance={showDistance}
          actionsLayout={actionsLayout}
          isCouponDisabled={isCouponDisabled}
        />
      ))}
    </div>
  )
}
