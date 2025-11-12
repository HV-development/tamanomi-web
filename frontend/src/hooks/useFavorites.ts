"use client"

import { useState, useCallback, useEffect } from 'react'
import type { Store } from '@/types/store'
import { getFavoritesFromStorage } from '@/lib/favorites-storage'

interface UseFavoritesResult {
  favoriteStores: Store[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseFavoritesOptions {
  allStores?: Store[]
}

export function useFavorites(isOpen: boolean, isAuthenticated: boolean, options?: UseFavoritesOptions): UseFavoritesResult {
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    // 未認証の場合はセッションストレージから取得
    if (!isAuthenticated) {
      setIsLoading(true)
      setError(null)
      
      try {
        const favoriteIds = getFavoritesFromStorage()
        
        // 全店舗データからお気に入り店舗をフィルタリング
        if (options?.allStores && favoriteIds.length > 0) {
          const favorites = options.allStores.filter(store => 
            favoriteIds.includes(store.id)
          )
          setFavoriteStores(favorites)
        } else {
          setFavoriteStores([])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'お気に入り一覧の取得に失敗しました'
        setError(errorMessage)
        console.error('お気に入り一覧取得エラー:', errorMessage)
        setFavoriteStores([])
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'お気に入り一覧の取得に失敗しました')
      }

      // APIレスポンスから店舗データを変換
      // レスポンス形式: { shops: [...], total: number }
      const shops = data.shops || []
      
      // 店舗データをStore型に変換（useInfiniteStoresと同じフォーマット）
      const stores: Store[] = shops.map((shop: {
        id: string
        name: string
        images?: string[] | null
        genre?: { id: string; name: string } | null
        genreId?: string
        genreLabel?: string
        fulladdress?: string
        address?: string
        prefecture?: string
        city?: string
        phone?: string
        description?: string
        latitude?: string | number
        longitude?: string | number
        couponUsageStart?: string
        couponUsageEnd?: string
        homepageUrl?: string
        details?: string
        holidays?: string
      }) => {
        // 既存のallStoresから該当する店舗を探して、thumbnailUrlを取得
        const existingStore = options?.allStores?.find((s: Store) => s.id === shop.id)
        const existingThumbnailUrl = existingStore?.thumbnailUrl || ''
        
        // 画像配列を処理（shop.imagesは配列またはnull/undefined）
        let images: string[] = []
        
        if (Array.isArray(shop.images)) {
          images = shop.images.filter((img: string | null | undefined) => img && String(img).trim().length > 0)
        } else if (shop.images) {
          // 単一の文字列の場合も配列に変換
          const imgStr = String(shop.images).trim()
          if (imgStr.length > 0) {
            images = [imgStr]
          }
        }
        
        // APIから取得したimagesがない場合は、既存のthumbnailUrlを使用
        let thumbnailUrl = ''
        if (images.length > 0 && images[0]) {
          thumbnailUrl = String(images[0]).trim()
        } else if (existingThumbnailUrl) {
          thumbnailUrl = existingThumbnailUrl
        }

        // 既存のStoreから必要なフィールドをマージ
        return {
          ...existingStore, // 既存のStoreデータを継承
          id: shop.id,
          name: shop.name,
          genre: shop.genre?.id || shop.genreId || existingStore?.genre || '',
          genreLabel: shop.genre?.name || shop.genre || existingStore?.genreLabel || '',
          address: shop.fulladdress || shop.address || existingStore?.address || '',
          prefecture: shop.prefecture || existingStore?.prefecture || undefined,
          city: shop.city || existingStore?.city || undefined,
          phone: shop.phone || existingStore?.phone || '',
          description: shop.description || existingStore?.description || '',
          thumbnailUrl, // 上で処理したthumbnailUrlを使用
          isFavorite: true,
          latitude: shop.latitude ? Number(shop.latitude) : (existingStore?.latitude || undefined),
          longitude: shop.longitude ? Number(shop.longitude) : (existingStore?.longitude || undefined),
          couponUsageStart: shop.couponUsageStart || existingStore?.couponUsageStart || undefined,
          couponUsageEnd: shop.couponUsageEnd || existingStore?.couponUsageEnd || undefined,
          homepageUrl: shop.homepageUrl || existingStore?.homepageUrl || undefined,
          details: shop.details || existingStore?.details || undefined,
          holidays: shop.holidays || existingStore?.holidays || undefined,
          // その他のフィールドは必要に応じて追加
        }
      })

      setFavoriteStores(stores)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'お気に入り一覧の取得に失敗しました'
      setError(errorMessage)
      console.error('お気に入り一覧取得エラー:', errorMessage)
      setFavoriteStores([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, options?.allStores])

  // お気に入り一覧ポップアップが開かれた時にAPIを呼び出す、またはセッションストレージから取得
  useEffect(() => {
    if (isOpen) {
      fetchFavorites()
    }
  }, [isOpen, isAuthenticated, fetchFavorites, options?.allStores])

  return {
    favoriteStores,
    isLoading,
    error,
    refetch: fetchFavorites,
  }
}

