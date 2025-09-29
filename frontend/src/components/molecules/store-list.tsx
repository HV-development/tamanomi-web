"use client"

import { StoreCard } from "../atoms/store-card"
import type { Store } from "../../types/store"

interface StoreListProps {
  stores: Store[]
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick?: (store: Store) => void
   showDistance?: boolean
  emptyMessage?: string
  emptyEmoji?: string
  className?: string
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
}: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">{emptyEmoji}</div>
        <div className="text-gray-600 text-lg font-medium">{emptyMessage}</div>
        <div className="text-gray-500 text-sm mt-2">新しいお店を探してみましょう</div>
      </div>
    )
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {stores.map((store, index) => (
        <div
          key={store.id}
          className="animate-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StoreCard 
            store={store} 
            onFavoriteToggle={onFavoriteToggle} 
            onCouponsClick={onCouponsClick}
            onStoreClick={onStoreClick}
             showDistance={showDistance}
          />
        </div>
      ))}
    </div>
  )
}
