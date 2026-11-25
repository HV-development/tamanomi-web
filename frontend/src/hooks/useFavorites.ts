"use client"

import { useState, useCallback, useEffect } from 'react'
import type { Store } from '@/types/store'
import type { ShopData } from '@hv-development/schemas'
import { getFavoritesFromStorage } from '@/lib/favorites-storage'
import { mapShopToStore } from '@/lib/shop-to-store'

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
      // レスポンス形式: { shops: [...], total: number }（1件は店舗一覧 GET /public/shops と同じ形）
      const shops: ShopData[] = data.shops || []

      // 店舗一覧はページごとに読むので、まだ読み込んでいない店舗もある。
      // 読み込み済みの店舗は一覧と同じものを使い、それ以外は API の内容を一覧と同じ変換で Store にする
      const stores: Store[] = shops.map((shop) => {
        const existingStore = options?.allStores?.find((s: Store) => s.id === shop.id)
        return { ...(existingStore ?? mapShopToStore(shop)), isFavorite: true }
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

