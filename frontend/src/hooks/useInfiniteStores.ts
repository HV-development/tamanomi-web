/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Store } from '@/types/store'

interface UseInfiniteStoresOptions {
  limit?: number
}

interface UseInfiniteStoresResult {
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  page: number
  hasMore: boolean
  sentinelRef: (node: Element | null) => void
  loadNext: () => Promise<{ items: Store[]; page: number; hasMore: boolean } | null>
  items: Store[]
}

export function useInfiniteStores(options: UseInfiniteStoresOptions = {}): UseInfiniteStoresResult {
  const { limit = 5 } = options

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelElementRef = useRef<Element | null>(null)
  const isFirstLoadRef = useRef(true)
  const [items, setItems] = useState<Store[]>([])

  const mapShopToStore = useCallback((shop: any): Store => {
    return {
      id: shop.id,
      name: shop.name,
      genre: shop.genre?.id || '',
      genreLabel: shop.genre?.name || '',
      address:
        shop.fulladdress ||
        [shop.prefecture, shop.city, shop.address1, shop.address2].filter(Boolean).join(' '),
      prefecture: shop.prefecture || undefined,
      city: shop.city || undefined,
      phone: shop.phone || '',
      description: shop.description || '',
      thumbnailUrl: shop.images?.[0] || '',
      isFavorite: false,
      latitude: shop.latitude ? Number(shop.latitude) : undefined,
      longitude: shop.longitude ? Number(shop.longitude) : undefined,
      couponUsageStart: shop.couponUsageStart || undefined,
      couponUsageEnd: shop.couponUsageEnd || undefined,
      usageScenes: (shop.scenes || shop.sceneIds || [])
        .map((s: any) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean),
      status: shop.status || 'active',
      merchantId: shop.merchantId,
      email: shop.merchant?.account?.email || shop.accountEmail || '',
      paymentSaicoin: !!shop.paymentSaicoin,
      paymentTamapon: !!shop.paymentTamapon,
      paymentCash: !!shop.paymentCash,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    }
  }, [])

  const fetchPage = useCallback(
    async (targetPage: number) => {
      try {
        const res = await fetch(`/api/shops?page=${targetPage}&limit=${limit}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const message = data?.error?.message || '店舗情報の取得に失敗しました'
          throw new Error(message)
        }

        const data = await res.json()
        const items: Store[] = (data?.shops || []).map(mapShopToStore)
        const pagination = data?.pagination || {}
        const totalPages = typeof pagination.totalPages === 'number' ? pagination.totalPages : targetPage

        return {
          items,
          page: targetPage,
          hasMore: targetPage < totalPages,
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'エラーが発生しました'
        throw new Error(message)
      }
    },
    [limit, mapShopToStore]
  )

  const loadNext = useCallback(async () => {
    // 直近でエラーが発生している場合や、ロード中/末尾到達時は再取得しない
    if (isLoading || isLoadingMore || !hasMore || error) return null
    setIsLoadingMore(true)
    setError(null)
    try {
      const result = await fetchPage(page + 1)
      setPage(result.page)
      setHasMore(result.hasMore)
      if (result.items?.length) {
        setItems(prev => [...prev, ...result.items])
      }
      setIsLoadingMore(false)
      return result
    } catch (e) {
      setIsLoadingMore(false)
      const message = e instanceof Error ? e.message : 'エラーが発生しました'
      setError(message)
      return null
    }
  }, [error, fetchPage, hasMore, isLoading, isLoadingMore, page])

  // 初回ロード
  useEffect(() => {
    let aborted = false
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchPage(1)
        if (aborted) return
        setPage(result.page)
        setHasMore(result.hasMore)
        setItems(result.items)
      } catch (e) {
        if (aborted) return
        const message = e instanceof Error ? e.message : 'エラーが発生しました'
        setError(message)
      } finally {
        if (!aborted) setIsLoading(false)
      }
    })()
    return () => {
      aborted = true
    }
  }, [fetchPage])

  // IntersectionObserver 設定
  const sentinelRef = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      sentinelElementRef.current = node

      if (!node) return

      observerRef.current = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          // 初回のマウント時はスキップ（既に初回ロード済み）
          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false
            return
          }
          if (entry.isIntersecting) {
            void loadNext()
          }
        },
        {
          root: null,
          rootMargin: '200px 0px',
          threshold: 0,
        }
      )

      observerRef.current.observe(node)
    },
    [loadNext]
  )

  return {
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    sentinelRef,
    loadNext,
    items,
  }
}


