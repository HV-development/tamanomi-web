"use client"

import { useEffect, useState } from "react"
import { StoreList } from "./StoreList"
import { X, Search as SearchIcon } from "lucide-react"
import type { Store } from "@/types/store"

interface SearchPopupProps {
  isOpen: boolean
  onClose: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick: (store: Store) => void
}

export function SearchPopup({ 
  isOpen, 
  onClose, 
  onFavoriteToggle, 
  onCouponsClick, 
  onStoreClick 
}: SearchPopupProps) {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // モーダルが開いている間、背後のスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // ポップアップが閉じられたときに検索キーワードと結果をリセット
  useEffect(() => {
    if (!isOpen) {
      setSearchKeyword("")
      setSearchResults([])
      setHasSearched(false)
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const queryParams = new URLSearchParams({
        keyword: searchKeyword.trim(),
        page: '1',
        limit: '50',
      })

      const response = await fetch(`/api/shops?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }

      const data = await response.json()
      
      // APIレスポンスから店舗データをマッピング
      const stores: Store[] = (data.shops || []).map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        genre: shop.genre?.id || '',
        genreLabel: shop.genre?.name || '',
        address: shop.fulladdress || shop.address || '',
        prefecture: shop.prefecture,
        city: shop.city,
        area: shop.area,
        phone: shop.phone || '',
        description: shop.description || '',
        thumbnailUrl: shop.thumbnailUrl,
        images: shop.images || [],
        isFavorite: shop.isFavorite || false,
        latitude: shop.latitude,
        longitude: shop.longitude,
        distance: shop.distance,
        couponUsageStart: shop.couponUsageStart,
        couponUsageEnd: shop.couponUsageEnd,
        couponUsageDays: shop.couponUsageDays,
        website: shop.website,
        homepageUrl: shop.homepageUrl,
        details: shop.details,
        businessHours: shop.businessHours,
        closedDays: shop.closedDays,
        holidays: shop.holidays,
        budget: shop.budget,
        smokingPolicy: shop.smokingPolicy,
        paymentMethods: shop.paymentMethods,
        usageScenes: shop.usageScenes,
      }))

      setSearchResults(stores)
    } catch (error) {
      console.error('検索エラー:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0 rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold">店舗検索</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 検索バー */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="店名で検索"
                  className="w-full px-4 py-2 pl-10 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchKeyword.trim()}
                className="px-6 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                検索
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain p-6 bg-transparent">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <div className="text-gray-600 text-lg font-medium">検索中...</div>
              </div>
            ) : hasSearched ? (
              <StoreList
                stores={searchResults}
                onFavoriteToggle={onFavoriteToggle}
                onCouponsClick={onCouponsClick}
                onStoreClick={onStoreClick}
                actionsLayout="vertical"
                emptyMessage="検索結果が見つかりませんでした"
                emptyEmoji="🔍"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-gray-600 text-lg font-medium">店名で検索してください</div>
                <div className="text-gray-500 text-sm mt-2">キーワードを入力して検索ボタンを押してください</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}


