"use client"

import Image from "next/image"
import { Phone, Clock, MapPin } from "lucide-react"
import { FavoriteButton } from "@/components/atoms/FavoriteButton"
import type { Store } from "@/types/store"
import { getGenreBackgroundClass, getGenreBackgroundStyle, getGenreBorderClass, getGenreBorderStyle, getGenreColor, getGenreTextClass, getGenreTextStyle } from "@/utils/genre-colors"
import { formatDistance } from "@/utils/location"
import { useEffect, useRef, useState } from "react"

interface StoreCardProps {
  store: Store
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick: (store: Store) => void
  showDistance?: boolean
  className?: string
  /** クーポン/店舗チェックボタンの並び方（お気に入りは縦、それ以外は既存の横並び） */
  actionsLayout?: "horizontal" | "vertical"
}

export function StoreCard({
  store,
  onFavoriteToggle,
  onCouponsClick,
  onStoreClick,
  showDistance = false,
  className = "",
  actionsLayout = "horizontal",
}: StoreCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageError, setIsImageError] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const genreColors = getGenreColor(store.genre)

  // 店舗に紐付く画像のみを使用（サンプル画像は除外）
  const images = Array.from(
    new Set(
      [
        store.thumbnailUrl,
        ...(store.images || []),
      ]
        .map((img) => (img ? img.trim() : ""))
        .filter((img) => img.length > 0)
    )
  )

  const shouldShowPlaceholder = images.length === 0 || isImageError

  useEffect(() => {
    setCurrentImageIndex(0)
    setIsImageError(false)
  }, [store.id, images.length])

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length <= 1) return
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation()
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (touchStartX.current === null || touchEndX.current === null) {
      return
    }

    const deltaX = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50 // 最小スワイプ距離

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // 左にスワイプ（次の画像）
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      } else {
        // 右にスワイプ（前の画像）
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    } else {
      // スワイプ距離が短い場合は通常のクリック処理
      handleImageClick(e as unknown as React.MouseEvent)
    }

    // リセット
    touchStartX.current = null
    touchEndX.current = null
  }

  const handlePhoneClick = () => {
    window.open(`tel:${store.phone}`, "_self")
  }

  const handleMapClick = () => {
    // 座標がある場合は緯度経度クエリで開く（精度が高い）
    if (typeof store.latitude === 'number' && typeof store.longitude === 'number') {
      const lat = store.latitude.toFixed(7)
      const lng = store.longitude.toFixed(7)
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      window.open(googleMapsUrl, "_blank")
      return
    }
    // 座標が無い場合は名称+住所で検索
    const query = encodeURIComponent(`${store.name} ${store.address}`)
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(googleMapsUrl, "_blank")
  }

  const handleStoreClick = (e: React.MouseEvent) => {
    // ボタンクリックの場合は何もしない
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }

    // デフォルトで店舗詳細を表示
    onStoreClick(store)
  }

  return (
    <div
      onClick={handleStoreClick}
      className={`bg-white rounded-2xl border border-green-600 p-5 space-y-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer ${className}`}
    >
      {/* ヘッダー部分 */}
      <div>
        {/* 店舗名と距離 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-900">{store.name}</h3>
          </div>
          <FavoriteButton
            isFavorite={store.isFavorite}
            onToggle={() => onFavoriteToggle(store.id)}
            className="flex-shrink-0"
          />
        </div>

        {/* ジャンルバッジと連絡先アイコン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              style={{
                ...getGenreBackgroundStyle(genreColors),
                ...getGenreBorderStyle(genreColors),
                ...getGenreTextStyle(genreColors),
              }}
              className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium border ${getGenreBackgroundClass(genreColors)} ${getGenreTextClass(genreColors)} ${getGenreBorderClass(genreColors)}`}
            >
              {store.genreLabel}
            </span>
            {showDistance && store.distance !== undefined && (
              <span className="text-black text-sm">現在位置から{formatDistance(store.distance)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePhoneClick}
              className="p-2 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200"
              aria-label="電話をかける"
            >
              <Phone className="w-4 h-4 text-green-600 hover:text-green-700 fill-current" />
            </button>
            <button
              onClick={handleMapClick}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200 text-green-600 text-xs font-semibold"
              aria-label="Googleマップで表示"
            >
              MAP
            </button>
          </div>
        </div>

        {/* アクセス情報 */}
        {(store.prefecture || store.city) && (
          <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span>{[store.prefecture, store.city].filter(Boolean).join(' ')}</span>
          </div>
        )}

        {/* 時間・曜日限定クーポン情報 */}
        {((store.couponUsageStart && store.couponUsageEnd) || (store.couponUsageDays && store.couponUsageDays.length > 0)) && (() => {
          // 曜日を月〜日の順にソートする
          const dayOrder = ['月', '火', '水', '木', '金', '土', '日']
          const sortDays = (days: string[]): string[] => {
            return days.sort((a, b) => {
              const indexA = dayOrder.indexOf(a)
              const indexB = dayOrder.indexOf(b)
              if (indexA === -1) return 1
              if (indexB === -1) return -1
              return indexA - indexB
            })
          }
          
          return (
            <div className="mt-1 flex items-center gap-2 text-green-600 text-sm">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {store.couponUsageStart && store.couponUsageEnd ? '時間限定クーポン' : '曜日限定クーポン'}
              </span>
              {/* クーポン利用可能曜日 */}
              {store.couponUsageDays && store.couponUsageDays.length > 0 && (
                <span>{sortDays(store.couponUsageDays.split(',').filter(Boolean).map(d => d.trim())).join(' ')}</span>
              )}
              {store.couponUsageStart && store.couponUsageEnd && (
                <span>{store.couponUsageStart}〜{store.couponUsageEnd}</span>
              )}
            </div>
          )
        })()}
      </div>

      {/* 店舗写真カルーセル / デフォルト画像 */}
      <div className="relative overflow-hidden">
        {shouldShowPlaceholder ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCouponsClick(store.id)
            }}
            className="w-full aspect-[4/3] md:aspect-[16/9] rounded-lg overflow-hidden bg-white flex items-center justify-center cursor-pointer relative"
            aria-label="店舗画像"
          >
            <Image
              src="/store-default.svg"
              alt="店舗デフォルト画像"
              fill
              className="object-contain p-4"
            />
          </button>
        ) : (
          <>
            <div
              className="w-full aspect-[4/3] md:aspect-[16/9] cursor-pointer select-none relative rounded-lg overflow-hidden"
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={images[currentImageIndex] || store.thumbnailUrl!}
                alt={`${store.name} ${currentImageIndex === 0 ? '外観' : currentImageIndex === 1 ? '店内' : '料理'}`}
                fill
                className="object-cover transition-opacity duration-300 pointer-events-none"
                onError={() => setIsImageError(true)}
              />
            </div>
            {/* インジケーター */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-white" : "bg-white/60"
                      }`}
                  ></div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 店舗紹介 */}
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{store.description}</div>

      {/* クーポンボタン */}
      <div className="pt-2">
        <div
          className={
            actionsLayout === "vertical"
              ? "flex flex-col gap-2"
              : "flex gap-3 max-[400px]:flex-col max-[400px]:gap-2"
          }
        >
          <button
            onClick={() => onCouponsClick(store.id)}
            className={
              actionsLayout === "vertical"
                ? "w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium"
                : "flex-1 max-[400px]:w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium"
            }
          >
            <span>今すぐクーポンGET</span>
          </button>

          <button
            onClick={() => onStoreClick(store)}
            className={
              actionsLayout === "vertical"
                ? "w-full flex items-center justify-center gap-1 bg-white hover:bg-gray-50 text-gray-700 py-3 px-3 rounded-2xl transition-all duration-300 border border-gray-300 hover:border-gray-400 font-medium whitespace-nowrap"
                : "flex items-center justify-center gap-1 max-[400px]:w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-3 rounded-2xl transition-all duration-300 border border-gray-300 hover:border-gray-400 font-medium whitespace-nowrap"
            }
          >
            <span className="text-sm">お店をチェック</span>
          </button>
        </div>
      </div>
    </div>
  )
}
