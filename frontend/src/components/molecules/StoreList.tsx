"use client"

import { StoreCard } from "./StoreCard"
import { FadeInComponent } from "@/components/atoms/ProgressiveLoader"
import type { Store } from "@/types/store"

interface StoreListProps {
  stores: Store[]
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick?: (store: Store) => void
  showDistance?: boolean
  emptyMessage?: string
  emptyEmoji?: string
  className?: string
  showEmptyMessage?: boolean
  isLoading?: boolean
}

export function StoreList({
  stores,
  onFavoriteToggle,
  onCouponsClick,
  onStoreClick,
  showDistance = false,
  emptyMessage = "店舗が見つかりませんでした",
  emptyEmoji = "🔍",
  className = "",
  showEmptyMessage = true,
  isLoading = false,
}: StoreListProps) {
  // ローディング中は何も表示しない
  if (isLoading) {
    return null
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
      {stores.map((store, index) => (
        <FadeInComponent key={store.id} delay={index * 100}>
          <StoreCard
            store={store}
            onFavoriteToggle={onFavoriteToggle}
            onCouponsClick={onCouponsClick}
            onStoreClick={onStoreClick ?? (() => { })}
            showDistance={showDistance}
          />
        </FadeInComponent>
      ))}
    </div>
  )
}
