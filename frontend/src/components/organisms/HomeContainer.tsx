"use client"

import { useMemo } from "react"
import { StoreList } from "@/components/molecules/StoreList";
import type { Store } from "@/types/store";
import { calculateDistance } from "@/utils/location";

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
  // 追加: 無限スクロール/エラー表示用
  loadMoreRef?: (node: Element | null) => void
  isLoadingMore?: boolean
  bottomError?: string | null
  currentLocation?: { latitude: number; longitude: number } | null
}

export function HomeContainer({ selectedGenres, selectedEvents, isNearbyFilter, isFavoritesFilter, stores, onStoreClick, onFavoriteToggle, onCouponsClick, backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100", loadMoreRef, isLoadingMore = false, bottomError = null, currentLocation }: HomeContainerProps) {
  // 店舗データをフィルタリング
  const filteredStores = useMemo(() => {
    const storesList = (stores ?? []).filter(store => {
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

    // 距離計算とソート処理（近くのお店フィルターがONで位置情報がある場合）
    if (isNearbyFilter && currentLocation) {
      const storesWithDistance = storesList.map(store => {
        // 店舗の座標がある場合のみ距離を計算
        if (store.latitude !== undefined && store.longitude !== undefined) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            store.latitude,
            store.longitude
          )
          return { store, distance }
        }
        // 座標がない場合は距離を無限大として扱う（末尾に配置）
        return { store, distance: Infinity }
      })

      // 距離の近い順にソート（座標がない店舗は末尾に配置）
      storesWithDistance.sort((a, b) => a.distance - b.distance)

      // 距離情報を店舗オブジェクトに追加
      return storesWithDistance.map(({ store, distance }) => ({
        ...store,
        distance: distance !== Infinity ? distance : undefined
      }))
    }

    return storesList
  }, [stores, selectedGenres, selectedEvents, isFavoritesFilter, isNearbyFilter, currentLocation])

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

        {/* ロード中インジケータ */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          </div>
        )}

        {/* 追加ロード時のエラー表示 */}
        {bottomError && (
          <div className="mt-4 mx-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {bottomError}
          </div>
        )}

        {/* 無限スクロール用セントリネル */}
        <div
          ref={(el) => {
            if (loadMoreRef) {
              loadMoreRef(el)
            }
          }}
          className="h-1 w-full"
        />
      </div>
    </div>
  )
}