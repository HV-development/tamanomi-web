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
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        throw new Error('認証情報が見つかりません。ログインしてください。')
      }

      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'お気に入り一覧の取得に失敗しました')
      }

      // APIレスポンスから店舗データを変換
      // レスポンス形式: { shops: [...], total: number }
      const shops = data.shops || []
      
      // 店舗データをStore型に変換（簡易版、必要に応じて詳細な変換を追加）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stores: Store[] = shops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        genre: shop.genre?.id || shop.genreId || '',
        genreLabel: shop.genre?.name || shop.genre || '',
        address: shop.fulladdress || shop.address || '',
        prefecture: shop.prefecture || undefined,
        city: shop.city || undefined,
        phone: shop.phone || '',
        description: shop.description || '',
        thumbnailUrl: shop.images?.[0] || '',
        isFavorite: true,
        latitude: shop.latitude ? Number(shop.latitude) : undefined,
        longitude: shop.longitude ? Number(shop.longitude) : undefined,
        couponUsageStart: shop.couponUsageStart || undefined,
        couponUsageEnd: shop.couponUsageEnd || undefined,
        homepageUrl: shop.homepageUrl || undefined,
        details: shop.details || undefined,
        holidays: shop.holidays || undefined,
        // その他のフィールドは必要に応じて追加
      }))

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

