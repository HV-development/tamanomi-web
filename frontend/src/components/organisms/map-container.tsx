"use client"

import { StoreList } from "../molecules/store-list";
import type { Store } from "../../types/store";
import { mockStores } from "../../data/mock-stores";

interface MapContainerProps {
  selectedGenres: string[]
  onStoreClick: (store: Store) => void
  onCouponsClick?: (storeId: string) => void
  isModalOpen?: boolean
}

export function MapContainer({ selectedGenres, onStoreClick, onCouponsClick, isModalOpen = false }: MapContainerProps) {
  // 店舗データをフィルタリング
  const filteredStores = mockStores.filter(store => {
    if (selectedGenres.length === 0) return true
    return selectedGenres.includes(store.genre)
  })

  const handleFavoriteToggle = (storeId: string) => {
    console.log("お気に入りトグル:", storeId)
    // 親コンポーネントに委譲
  }

  return (
    <div className="flex-1 relative bg-gradient-to-br from-green-50 to-green-100">
      {/* 店舗リスト */}
      <div className="h-full overflow-y-auto p-4">
        <StoreList
          stores={filteredStores}
          onFavoriteToggle={handleFavoriteToggle}
          onCouponsClick={onCouponsClick || (() => {})}
          onStoreClick={onStoreClick}
          emptyMessage="条件に合う店舗が見つかりませんでした"
          emptyEmoji="🔍"
        />
      </div>
    </div>
  )
}