"use client"

import { StoreList } from "../molecules/store-list";
import type { Store } from "../../types/store";
import { mockStores } from "../../data/mock-stores";

interface HomeContainerProps {
  selectedGenres: string[]
  isFavoritesFilter: boolean
  onStoreClick: (store: Store) => void
  onCouponsClick?: (storeId: string) => void
  isModalOpen?: boolean
}

export function HomeContainer({ selectedGenres, isFavoritesFilter, onStoreClick, onCouponsClick, isModalOpen = false }: HomeContainerProps) {
  // 店舗データをフィルタリング
  const filteredStores = mockStores.filter(store => {
    // ジャンルフィルター
    if (selectedGenres.length > 0 && !selectedGenres.includes(store.genre)) {
      return false
    }
    // お気に入りフィルター
    if (isFavoritesFilter && !store.isFavorite) {
      return false
    }
    return true
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