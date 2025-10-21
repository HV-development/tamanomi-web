"use client"

import { StoreList } from "@/components/molecules/StoreList";
import type { Store } from "@/types/store";

interface HomeContainerProps {
  selectedGenres: string[] | undefined
  selectedEvents: string[] | undefined
  isNearbyFilter: boolean
  isFavoritesFilter: boolean
  stores: Store[] | undefined
  onStoreClick: (store: Store) => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick?: (storeId: string) => void
  isModalOpen?: boolean
  backgroundColorClass?: string
}

export function HomeContainer({ selectedGenres, selectedEvents, isNearbyFilter, isFavoritesFilter, stores, onStoreClick, onFavoriteToggle, onCouponsClick, backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100" }: HomeContainerProps) {
  // 店舗データをフィルタリング
  const filteredStores = (stores ?? []).filter(store => {
    // ジャンルフィルター
    if ((selectedGenres?.length ?? 0) > 0 && !selectedGenres?.includes(store.genre)) {
      return false
    }
    // イベントフィルター
    if ((selectedEvents?.length ?? 0) > 0 && store.usageScenes) {
      const hasMatchingEvent = selectedEvents?.some(event => {
        // イベント値を店舗の利用シーンにマッピング
        const eventMapping: Record<string, string[]> = {
          date: ["デート"],
          business: ["接待"],
          friends: ["友人と", "女子会", "合コン"],
          family: ["家族、子供と"],
          solo: ["おひとり様"],
          group: ["グループ", "宴会"],
          party: ["宴会", "合コン"],
          celebration: ["お祝い"],
          casual: ["カジュアル"],
          formal: ["フォーマル", "接待"],
          lunch: ["ランチ"],
          dinner: ["ディナー"],
        }

        const mappedScenes = eventMapping[event] || []
        return mappedScenes.some(scene => store.usageScenes?.includes(scene))
      })

      if (!hasMatchingEvent) {
        return false
      }
    }
    // お気に入りフィルター
    if (isFavoritesFilter && !store.isFavorite) {
      return false
    }
    return true
  })



  return (
    <div className={`flex-1 relative ${backgroundColorClass}`}>
      {/* 店舗リスト */}
      <div className="h-full overflow-y-auto p-4">
        <StoreList
          stores={filteredStores}
          onFavoriteToggle={onFavoriteToggle}
          onCouponsClick={onCouponsClick || (() => { })}
          onStoreClick={onStoreClick}
          showDistance={isNearbyFilter}
          emptyMessage="条件に合う店舗が見つかりませんでした"
          emptyEmoji="🔍"
        />
      </div>
    </div>
  )
}