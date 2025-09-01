"use client"

import { Navigation, Phone, Globe, Ticket, Info } from "lucide-react"
import { FavoriteButton } from "./favorite-button"
import type { Store } from "../../types/store"
import { getGenreColor } from "../../utils/genre-colors"

interface StoreCardProps {
  store: Store
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onStoreClick: (store: Store) => void
  className?: string
}

// ジャンルに応じた店内画像を取得
const getStoreInteriorImage = (genre: string) => {
  const interiorImages: Record<string, string> = {
    izakaya: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    italian: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    yakiniku: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    japanese: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    bar: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    default: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
  }
  return interiorImages[genre] || interiorImages.default
}

// ジャンルに応じた料理画像を取得
const getStoreFoodImage = (genre: string) => {
  const foodImages: Record<string, string> = {
    izakaya: "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    italian: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    yakiniku: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    japanese: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    bar: "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    default: "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
  }
  return foodImages[genre] || foodImages.default
}

export function StoreCard({ store, onFavoriteToggle, onCouponsClick, onStoreClick, className = "" }: StoreCardProps) {
  const handlePhoneClick = () => {
    window.open(`tel:${store.phone}`, "_self")
  }

  const handleWebsiteClick = () => {
    if (store.website) {
      window.open(store.website, "_blank")
    }
  }

  const handleMapClick = () => {
    // Googleマップで店舗を検索
    const query = encodeURIComponent(`${store.name} ${store.address}`)
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(googleMapsUrl, "_blank")
  }

  const handleStoreClick = (e: React.MouseEvent) => {
    // ボタンクリックの場合は詳細表示しない
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
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
            <span className="inline-block px-3 py-1.5 rounded-full text-sm font-medium border bg-gray-100 text-gray-700 border-gray-300">
              {store.genreLabel}
            </span>
            <span className="text-black text-sm">現在位置から350m</span>
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
                className="p-2 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200"
                aria-label="Googleマップで表示"
              >
                <Navigation className="w-4 h-4 text-green-600 hover:text-green-700 fill-current transition-colors" />
              </button>
          </div>
        </div>
      </div>

      {/* 店舗写真カルーセル */}
      <div className="relative overflow-hidden">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex-shrink-0 w-full aspect-[3/1] snap-start">
            <img
              src={store.thumbnailUrl || "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"}
              alt={`${store.name} 外観`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-shrink-0 w-full aspect-[3/1] snap-start">
            <img
              src={getStoreInteriorImage(store.genre)}
              alt={`${store.name} 店内`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-shrink-0 w-full aspect-[3/1] snap-start">
            <img
              src={getStoreFoodImage(store.genre)}
              alt={`${store.name} 料理`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* インジケーター */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 店舗紹介 */}
      <div className="text-sm text-gray-700 leading-relaxed">{store.description}</div>

      {/* クーポンボタン */}
      <div className="pt-2">
        <div className="flex gap-3">
          <button
            onClick={() => onCouponsClick(store.id)}
            className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium"
          >
            <span>クーポン一覧</span>
          </button>
          
          <button
            onClick={() => onStoreClick(store)}
            className="flex items-center justify-center gap-1 bg-white hover:bg-gray-50 text-gray-700 py-3 px-3 rounded-2xl transition-all duration-300 border border-gray-300 hover:border-gray-400 font-medium whitespace-nowrap"
          >
            <span className="text-sm">店舗詳細</span>
          </button>
        </div>
      </div>
    </div>
  )
}