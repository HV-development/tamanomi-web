"use client"

import { useMemo } from "react"
import { StoreList } from "@/components/molecules/StoreList";
import type { Store } from "@/types/store";
import { calculateDistance } from "@/utils/location";
import { mapAreasToCities } from "@/utils/area-mapping";

interface HomeContainerProps {
  selectedGenres: string[] | undefined
  selectedEvents: string[] | undefined
  selectedAreas?: string[] | undefined
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
  // 初期ローディング状態
  isInitialLoading?: boolean
}

export function HomeContainer({ 
  selectedGenres: _selectedGenres, // eslint-disable-line @typescript-eslint/no-unused-vars
  selectedEvents, 
  selectedAreas, 
  isNearbyFilter, 
  isFavoritesFilter, 
  stores, 
  onStoreClick, 
  onFavoriteToggle, 
  onCouponsClick, 
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100", 
  loadMoreRef, 
  isLoadingMore = false, 
  bottomError = null, 
  currentLocation,
  isInitialLoading = false
}: HomeContainerProps) {
  // 店舗データをフィルタリング
  const filteredStores = useMemo(() => {
    const storesList = (stores ?? []).filter(store => {
    // エリアフィルター（クライアントサイドフォールバック）
    if ((selectedAreas?.length ?? 0) > 0) {
      const selectedCities = mapAreasToCities(selectedAreas)
      // 店舗のcityが選択されたエリアの市区町村名に含まれているかチェック
      if (store.city && selectedCities.length > 0) {
        const matchesArea = selectedCities.some(city => store.city?.includes(city))
        if (!matchesArea) {
          return false
        }
      } else if (!store.city) {
        // 店舗にcity情報がない場合は除外（フィルターが適用されている場合）
        return false
      }
    }
    // ジャンルフィルター（サーバーサイドでフィルタリング済みのため、クライアントサイドでは不要）
    // サーバーサイドで既にフィルタリングされているため、ここでのフィルタリングは不要
    // if ((selectedGenres?.length ?? 0) > 0 && !selectedGenres?.includes(store.genre)) {
    //   return false
    // }
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

    // 近くのお店: 並び順はサーバーの距離順ソートを信頼し、クライアントは距離表示のみ付与する
    if (isNearbyFilter && currentLocation) {
      return storesList.map((store) => {
        if (store.latitude === undefined || store.longitude === undefined) return store
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          store.latitude,
          store.longitude
        )
        return { ...store, distance }
      })
    }

    // 近くのお店フィルターがOFFの場合は、店舗名カナ順でソート
    return [...storesList].sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  }, [stores, selectedAreas, selectedEvents, isFavoritesFilter, isNearbyFilter, currentLocation])

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
          showEmptyMessage={!isInitialLoading && stores !== undefined && stores.length === 0}
          isLoading={isInitialLoading}
        />

        {/* 追加ロード時のローディング表示 */}
        {isLoadingMore && (
          <div className="mt-4 mx-2 flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
            <div className="text-gray-500 text-sm">読み込み中...</div>
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