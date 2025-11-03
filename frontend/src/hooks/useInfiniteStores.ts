/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Store } from '@/types/store'
import { isFavoriteInStorage } from '@/lib/favorites-storage'
import { mapAreasToCities } from '@/utils/area-mapping'
import { mapGenresToIds } from '@/utils/genre-mapping'

interface UseInfiniteStoresOptions {
  limit?: number
  selectedAreas?: string[]
  selectedGenres?: string[]
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
  const { limit = 5, selectedAreas = [], selectedGenres = [] } = options

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelElementRef = useRef<Element | null>(null)
  const isFirstLoadRef = useRef(true)
  const [items, setItems] = useState<Store[]>([])
  
  // フィルターが変更されたときに再取得するためのキー
  const filterKeyRef = useRef<string>('')

  const mapShopToStore = useCallback((shop: any): Store => {
    // paymentCreditとpaymentCodeの構造を解析
    const parsePaymentCredit = (paymentCredit: any): string[] => {
      if (!paymentCredit) return []
      let brands: string[] = []
      let other: string | undefined
      
      if (typeof paymentCredit === 'string') {
        try {
          const parsed = JSON.parse(paymentCredit)
          brands = Array.isArray(parsed.brands) ? parsed.brands : []
          other = parsed.other
        } catch {
          return []
        }
      } else if (typeof paymentCredit === 'object') {
        brands = Array.isArray(paymentCredit.brands) ? paymentCredit.brands : []
        other = paymentCredit.other
      }
      
      // otherがある場合は配列に追加
      if (other && other.trim()) {
        return [...brands, other]
      }
      return brands
    }

    const parsePaymentCode = (paymentCode: any): string[] => {
      if (!paymentCode) return []
      let services: string[] = []
      let other: string | undefined
      
      if (typeof paymentCode === 'string') {
        try {
          const parsed = JSON.parse(paymentCode)
          services = Array.isArray(parsed.services) ? parsed.services : []
          other = parsed.other
        } catch {
          return []
        }
      } else if (typeof paymentCode === 'object') {
        services = Array.isArray(paymentCode.services) ? paymentCode.services : []
        other = paymentCode.other
      }
      
      // otherがある場合は配列に追加
      if (other && other.trim()) {
        return [...services, other]
      }
      return services
    }

    // paymentMethodsを構築
    const creditCards = parsePaymentCredit(shop.paymentCredit)
    const digitalPayments = parsePaymentCode(shop.paymentCode)
    const hasPaymentMethods = !!shop.paymentSaicoin || !!shop.paymentTamapon || !!shop.paymentCash || creditCards.length > 0 || digitalPayments.length > 0

    // セッションストレージからお気に入り状態を確認（APIから取得できない場合のフォールバック）
    let isFavorite = shop.isFavorite || false
    if (!isFavorite && typeof window !== 'undefined') {
      try {
        isFavorite = isFavoriteInStorage(shop.id)
      } catch {
        // セッションストレージのチェックに失敗した場合はAPIの値をそのまま使用
      }
    }

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
      isFavorite,
      latitude: shop.latitude ? Number(shop.latitude) : undefined,
      longitude: shop.longitude ? Number(shop.longitude) : undefined,
      couponUsageStart: shop.couponUsageStart || undefined,
      couponUsageEnd: shop.couponUsageEnd || undefined,
      homepageUrl: shop.homepageUrl || undefined,
      details: shop.details || undefined,
      businessHours: shop.businessHours || undefined,
      closedDays: shop.holidays || shop.closedDays || undefined,
      holidays: shop.holidays || undefined,
      smokingPolicy: shop.smokingType || shop.smokingPolicy || undefined,
      usageScenes: (() => {
        // 利用シーンの配列を構築
        const scenes: string[] = (shop.scenes || shop.sceneIds || [])
          .map((s: any) => (typeof s === 'string' ? s : s?.name))
          .filter(Boolean)
        
        // customSceneTextがある場合は「その他：customSceneText」の形式で追加
        if (shop.customSceneText && shop.customSceneText.trim()) {
          scenes.push(`その他：${shop.customSceneText.trim()}`)
        }
        
        return scenes
      })(),
      paymentMethods: hasPaymentMethods ? {
        saicoin: !!shop.paymentSaicoin,
        tamapon: !!shop.paymentTamapon,
        cash: !!shop.paymentCash,
        creditCards,
        digitalPayments,
      } : undefined,
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

  // 最新のfetchPageを保持するためのref（初期値は空の関数）
  const fetchPageRef = useRef<((targetPage: number) => Promise<{ items: Store[]; page: number; hasMore: boolean }>) | null>(null)

  const fetchPage = useCallback(
    async (targetPage: number) => {
      try {
        // 認証トークンを取得（存在する場合）
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        // 認証トークンが存在する場合はAuthorizationヘッダーに含める
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
        
        // フィルターパラメータを構築
        const queryParams = new URLSearchParams({
          page: targetPage.toString(),
          limit: limit.toString(),
        })
        
        // エリアフィルターを追加（複数エリアの場合はOR条件で処理）
        if (selectedAreas.length > 0) {
          const cities = mapAreasToCities(selectedAreas)
          console.log('[useInfiniteStores] Map areas to cities:', { selectedAreas, cities })
          // 複数のエリアがある場合は、各エリアに対してクエリを実行する必要があるが、
          // バックエンドAPIが複数のcityパラメータをサポートしているか確認が必要
          // 暫定的には最初のエリアのみを使用
          if (cities.length > 0) {
            queryParams.append('city', cities[0])
          }
        }
        
        // ジャンルフィルターを追加
        if (selectedGenres.length > 0) {
          const genreIds = await mapGenresToIds(selectedGenres)
          console.log('[useInfiniteStores] Map genres to IDs:', { selectedGenres, genreIds })
          // 複数のジャンルがある場合は、各ジャンルに対してクエリを実行する必要があるが、
          // バックエンドAPIが複数のgenreIdパラメータをサポートしているか確認が必要
          // 暫定的には最初のジャンルのみを使用
          if (genreIds.length > 0) {
            queryParams.append('genreId', genreIds[0])
          }
        }
        
        const url = `/api/shops?${queryParams.toString()}`
        console.log('[useInfiniteStores] Fetching:', url)
        
        const res = await fetch(url, {
          method: 'GET',
          headers,
        })

        console.log('[useInfiniteStores] Response status:', res.status)
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const message = data?.error?.message || '店舗情報の取得に失敗しました'
          console.error('[useInfiniteStores] Response error:', data)
          throw new Error(message)
        }

        const data = await res.json()
        console.log('[useInfiniteStores] Response data:', {
          shopsCount: data?.shops?.length || 0,
          pagination: data?.pagination,
        })
        
        const items: Store[] = (data?.shops || []).map(mapShopToStore)
        const pagination = data?.pagination || {}
        const totalPages = typeof pagination.totalPages === 'number' ? pagination.totalPages : targetPage

        console.log('[useInfiniteStores] Mapped items:', items.length)

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
    [limit, mapShopToStore, selectedAreas, selectedGenres]
  )
  
  // fetchPageが変更されたらrefを更新
  useEffect(() => {
    fetchPageRef.current = fetchPage
  }, [fetchPage])

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
    // 初回ロードは一度だけ実行
    if (filterKeyRef.current !== '') {
      return
    }
    
    filterKeyRef.current = `${selectedAreas.join(',')}:${selectedGenres.join(',')}`
    
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
        isFirstLoadRef.current = true
      } catch (e) {
        if (aborted) return
        const message = e instanceof Error ? e.message : 'エラーが発生しました'
        console.error('[useInfiniteStores] Initial load error:', message, e)
        setError(message)
      } finally {
        if (!aborted) setIsLoading(false)
      }
    })()
    return () => {
      aborted = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // フィルターが変更されたときに再取得
  useEffect(() => {
    const currentFilterKey = `${selectedAreas.join(',')}:${selectedGenres.join(',')}`
    
    console.log('[useInfiniteStores] Filter effect:', {
      currentFilterKey,
      previousFilterKey: filterKeyRef.current,
      willFetch: filterKeyRef.current !== currentFilterKey && filterKeyRef.current !== '',
      selectedAreas,
      selectedGenres,
    })
    
    // フィルターが変更された場合のみ再取得（初回マウント時は上記のuseEffectで処理）
    if (filterKeyRef.current !== currentFilterKey && filterKeyRef.current !== '') {
      filterKeyRef.current = currentFilterKey
      
      // 状態をリセット
      setPage(1)
      setHasMore(true)
      setIsLoading(true)
      setError(null)
      setItems([])
      isFirstLoadRef.current = true
      
      console.log('[useInfiniteStores] Starting fetch...', {
        selectedAreas,
        selectedGenres,
      })
      
      // 再取得を実行（fetchPageRefを使用して最新のfetchPageを参照）
      let aborted = false
      ;(async () => {
        try {
          // fetchPageRefを使用して最新のfetchPageを呼び出す
          // fetchPageRefは常に最新のfetchPageを保持している
          const currentFetchPage = fetchPageRef.current || fetchPage
          const result = await currentFetchPage(1)
          if (aborted) {
            console.log('[useInfiniteStores] Fetch aborted')
            return
          }
          console.log('[useInfiniteStores] Fetch success:', {
            itemsCount: result.items.length,
            page: result.page,
            hasMore: result.hasMore,
          })
          setPage(result.page)
          setHasMore(result.hasMore)
          setItems(result.items)
        } catch (e) {
          if (aborted) return
          const message = e instanceof Error ? e.message : 'エラーが発生しました'
          console.error('[useInfiniteStores] Fetch error:', message, e)
          setError(message)
        } finally {
          if (!aborted) setIsLoading(false)
        }
      })()
      
      return () => {
        aborted = true
      }
    } else {
      console.log('[useInfiniteStores] Skip fetch (same filter key or initial load)')
      // 初回マウント時はfilterKeyRefを設定
      if (filterKeyRef.current === '') {
        filterKeyRef.current = currentFilterKey
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreas, selectedGenres])

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


