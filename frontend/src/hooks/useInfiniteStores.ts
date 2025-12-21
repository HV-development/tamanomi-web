/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Store } from '@/types/store'
import type { ShopData } from '@hv-development/schemas'
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

  const mapShopToStore = useCallback((shop: ShopData): Store => {
    // paymentCreditとpaymentCodeの構造を解析
    const parsePaymentCredit = (paymentCredit: string | { brands?: string[]; other?: string } | undefined): string[] => {
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

    const parsePaymentCode = (paymentCode: string | { services?: string[]; other?: string } | undefined): string[] => {
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
        isFavorite = isFavoriteInStorage(shop.id as string)
      } catch {
        // セッションストレージのチェックに失敗した場合はAPIの値をそのまま使用
      }
    }

    // genreの型を安全に取得
    const genre = shop.genre as { id?: string; name?: string } | undefined

    // 型安全にプロパティを取得
    const fulladdress = shop.fulladdress as string | undefined
    const prefecture = shop.prefecture as string | undefined
    const city = shop.city as string | undefined
    const address1 = shop.address1 as string | undefined
    const address2 = shop.address2 as string | undefined
    const phone = shop.phone as string | undefined
    const description = shop.description as string | undefined
    const images = shop.images as string[] | undefined
    const scenes = shop.scenes as (string | { name?: string })[] | undefined
    const sceneIds = shop.sceneIds as (string | { name?: string })[] | undefined
    const customSceneText = shop.customSceneText as string | undefined
    const status = shop.status as string | undefined
    const merchantId = shop.merchantId as string | undefined
    const merchant = shop.merchant as { account?: { email?: string } } | undefined
    const accountEmail = shop.accountEmail as string | undefined
    const createdAt = shop.createdAt as string | undefined
    const updatedAt = shop.updatedAt as string | undefined

    return {
      id: shop.id as string,
      name: shop.name as string,
      genre: genre?.id || '',
      genreLabel: genre?.name || '',
      address:
        fulladdress ||
        [prefecture, city, address1, address2].filter(Boolean).join(' '),
      prefecture: prefecture || undefined,
      city: city || undefined,
      phone: phone || '',
      description: description || '',
      thumbnailUrl: images?.[0] || '',
      isFavorite,
      latitude: shop.latitude ? Number(shop.latitude) : undefined,
      longitude: shop.longitude ? Number(shop.longitude) : undefined,
      couponUsageStart: shop.couponUsageStart || undefined,
      couponUsageEnd: shop.couponUsageEnd || undefined,
      couponUsageDays: shop.couponUsageDays || undefined,
      homepageUrl: shop.homepageUrl || undefined,
      details: shop.details || undefined,
      businessHours: shop.businessHours || undefined,
      closedDays: shop.holidays || shop.closedDays || undefined,
      holidays: shop.holidays || undefined,
      smokingPolicy: shop.smokingType || shop.smokingPolicy || undefined,
      usageScenes: (() => {
        // 利用シーンの配列を構築（「その他」は除外）
        const sceneArray: string[] = (scenes || sceneIds || [])
          .map((s: string | { name?: string } | undefined) => (typeof s === 'string' ? s : s?.name))
          .filter(Boolean) as string[]

        return sceneArray
      })(),
      customSceneText: customSceneText && typeof customSceneText === 'string' && customSceneText.trim()
        ? customSceneText.trim()
        : undefined,
      paymentMethods: hasPaymentMethods ? {
        saicoin: !!shop.paymentSaicoin,
        tamapon: !!shop.paymentTamapon,
        cash: !!shop.paymentCash,
        creditCards,
        digitalPayments,
      } : undefined,
      status: status || 'active',
      merchantId: merchantId,
      email: merchant?.account?.email || accountEmail || '',
      paymentSaicoin: !!shop.paymentSaicoin,
      paymentTamapon: !!shop.paymentTamapon,
      paymentCash: !!shop.paymentCash,
      createdAt: createdAt,
      updatedAt: updatedAt,
    }
  }, [])

  // 最新のfetchPageを保持するためのref（初期値は空の関数）
  const fetchPageRef = useRef<((targetPage: number) => Promise<{ items: Store[]; page: number; hasMore: boolean }>) | null>(null)

  const fetchPage = useCallback(
    async (targetPage: number) => {
      try {
        // Cookieベースの認証のみを使用（localStorageは廃止）
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // フィルターパラメータを構築
        const queryParams = new URLSearchParams({
          page: targetPage.toString(),
          limit: limit.toString(),
        })

        // エリアフィルターを追加（複数エリアの場合はOR条件で処理）
        if (selectedAreas.length > 0) {
          const cities = mapAreasToCities(selectedAreas)
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
          // 複数のジャンルがある場合は、各ジャンルに対してクエリを実行する必要があるが、
          // バックエンドAPIが複数のgenreIdパラメータをサポートしているか確認が必要
          // 暫定的には最初のジャンルのみを使用
          if (genreIds.length > 0) {
            queryParams.append('genreId', genreIds[0])
          }
        }

        const url = `/api/shops?${queryParams.toString()}`

        let res: Response
        try {
          res = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include', // Cookieを送信
          })
        } catch (fetchError) {
          console.error('[useInfiniteStores] Fetch error:', {
            error: fetchError,
            errorType: typeof fetchError,
            errorName: fetchError instanceof Error ? fetchError.name : 'Unknown',
            errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError),
            errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
            url,
          })
          throw new Error(`ネットワークエラーが発生しました: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`)
        }

        // レスポンスをテキストとして取得（成功・失敗どちらの場合でも使用）
        let responseText = ''
        try {
          responseText = await res.text()
        } catch (textError) {
          console.error('[useInfiniteStores] Failed to read response text:', textError)
          responseText = ''
        }

        if (!res.ok) {
          interface ErrorData {
            error?: {
              message?: string;
              code?: string;
            };
            message?: string;
          }
          let data: ErrorData | string | null = null
          let errorMessage = ''

          if (responseText.trim()) {
            try {
              data = JSON.parse(responseText) as ErrorData
            } catch (jsonError) {
              console.error('[useInfiniteStores] Failed to parse JSON:', jsonError)
              console.error('[useInfiniteStores] Response text (first 500 chars):', responseText.substring(0, 500))
              // JSON解析に失敗した場合は、テキストをメッセージとして使用
              data = { message: responseText.substring(0, 200) || 'レスポンスの解析に失敗しました' }
            }
          } else {
            // レスポンスが空の場合
            console.error('[useInfiniteStores] Empty response body')
            data = { message: `レスポンスが空です (${res.status})` }
          }

          // エラーメッセージの抽出（複数の形式に対応）
          if (typeof data === 'object' && data !== null && 'error' in data && data.error?.message) {
            errorMessage = data.error.message
          } else if (typeof data === 'object' && data !== null && 'error' in data && data.error?.code) {
            errorMessage = data.error.code
          } else if (typeof data === 'object' && data !== null && 'message' in data && data.message) {
            errorMessage = data.message
          } else if (typeof data === 'string') {
            errorMessage = data
          } else if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
            // 空のオブジェクトの場合
            errorMessage = `店舗情報の取得に失敗しました (${res.status} ${res.statusText})`
          } else {
            errorMessage = `店舗情報の取得に失敗しました (${res.status})`
          }

          console.error('[useInfiniteStores] Response error:', {
            status: res.status,
            statusText: res.statusText,
            url: res.url,
            requestUrl: url,
            data,
            dataStringified: JSON.stringify(data),
            responseTextLength: responseText.length,
            responseTextPreview: responseText.substring(0, 500),
            errorMessage,
          })
          throw new Error(errorMessage)
        }

        // 成功時はJSONとして解析
        let data: any = {}
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText)
          } catch (jsonError) {
            console.error('[useInfiniteStores] Failed to parse success response as JSON:', jsonError)
            console.error('[useInfiniteStores] Response text (first 500 chars):', responseText.substring(0, 500))
            throw new Error('レスポンスの解析に失敗しました')
          }
        } else {
          console.error('[useInfiniteStores] Empty success response body')
          throw new Error('レスポンスが空です')
        }

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

  // 初回ロード完了を追跡するref
  const initialLoadCompletedRef = useRef(false)
  // 初回ロードの実行中フラグをrefで管理
  const initialLoadInProgressRef = useRef(false)

  // 初回ロード（マウント時のみ実行）
  useEffect(() => {
    // 初回ロードは一度だけ実行（filterKeyRef.currentが空で、まだ完了していない場合のみ）
    if (filterKeyRef.current !== '' || initialLoadCompletedRef.current || initialLoadInProgressRef.current) {
      return
    }

    const currentFilterKey = `${selectedAreas.join(',')}:${selectedGenres.join(',')}`
    filterKeyRef.current = currentFilterKey
    initialLoadInProgressRef.current = true

    const fetchInitialData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchPage(1)
        // 初回ロードが完了しているかチェック
        if (initialLoadCompletedRef.current) {
          return
        }
        setPage(result.page)
        setHasMore(result.hasMore)
        setItems(result.items)
        isFirstLoadRef.current = true
        initialLoadCompletedRef.current = true
      } catch (e) {
        if (initialLoadCompletedRef.current) return
        const message = e instanceof Error ? e.message : 'エラーが発生しました'
        console.error('[useInfiniteStores] Initial load error:', {
          message,
          error: e,
          errorType: typeof e,
          errorName: e instanceof Error ? e.name : 'Unknown',
          errorStack: e instanceof Error ? e.stack : undefined,
        })
        setError(message)
      } finally {
        initialLoadInProgressRef.current = false
        if (!initialLoadCompletedRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchInitialData()

    // クリーンアップ関数は不要（refで管理しているため）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // フィルター変更時のデータ取得
  useEffect(() => {
    // 初回マウント時はスキップ（上記のuseEffectで処理）
    if (filterKeyRef.current === '') {
      return
    }

    const currentFilterKey = `${selectedAreas.join(',')}:${selectedGenres.join(',')}`

    // フィルターが変更された場合のみ再取得
    if (filterKeyRef.current !== currentFilterKey) {
      filterKeyRef.current = currentFilterKey

      // 状態をリセット
      setPage(1)
      setHasMore(true)
      setIsLoading(true)
      setError(null)
      setItems([])
      isFirstLoadRef.current = true

      // 再取得を実行
      let aborted = false
        ; (async () => {
          try {
            const currentFetchPage = fetchPageRef.current || fetchPage
            const result = await currentFetchPage(1)
            if (aborted) {
              return
            }
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

