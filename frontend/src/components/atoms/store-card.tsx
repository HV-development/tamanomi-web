"use client"

import { MapPin, Phone, Globe, Ticket, Info } from "lucide-react"
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
    izakaya: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    italian: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    yakiniku: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg",
    japanese: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    bar: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg",
    default: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"
  }
  return interiorImages[genre] || interiorImages.default
}

// ジャンルに応じた料理画像を取得
const getStoreFoodImage = (genre: string) => {
  const foodImages: Record<string, string> = {
    izakaya: "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg",
    italian: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    yakiniku: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg",
    japanese: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
    bar: "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg",
    default: "https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg"
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
    onStoreClick(store)
  }
  return (
    <div
      onClick={handleStoreClick}
      className={`bg-white rounded-2xl border border-green-200 p-5 space-y-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer ${className}`}
    >
      {/* ヘッダー部分 */}
      <div>
        {/* 店舗名と距離 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900">{store.name}</h3>
          </div>
          <FavoriteButton
            isFavorite={store.isFavorite}
            onToggle={() => onFavoriteToggle(store.id)}
          className="ml-3 scale-75 flex-shrink-0"
          />
        </div>
        
        {/* ジャンルバッジと連絡先アイコン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium border ${getGenreColor(store.genre).bg} ${getGenreColor(store.genre).text} ${getGenreColor(store.genre).border}`}>
              {store.genreLabel}
            </span>
            <span className="text-green-600 font-medium text-sm">350m</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePhoneClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="電話をかける"
            >
              <Phone className="w-4 h-4 text-gray-600 hover:text-green-600" />
            </button>
            <button
              onClick={handleMapClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Googleマップで表示"
            >
              <MapPin className="w-4 h-4 text-gray-600 hover:text-blue-600" />
            </button>
          </div>
        </div>

        {/* 営業時間・定休日情報 */}
        {store.businessHours && (
          <div className="text-sm font-medium text-gray-700 mt-3">
            営業時間　：{store.businessHours}
          </div>
        )}
        {store.closedDays && (
          <div className="text-sm font-medium text-gray-700 mt-1">
            定休日　　：{store.closedDays}
          </div>
        )}
      </div>

      {/* 店舗写真3枚横並び */}
      <div className="grid grid-cols-3 gap-1 relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={store.thumbnailUrl || "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"}
            alt={`${store.name} 外観`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="aspect-square overflow-hidden">
          <img
            src={getStoreInteriorImage(store.genre)}
            alt={`${store.name} 店内`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="aspect-square overflow-hidden">
          <img
            src={getStoreFoodImage(store.genre)}
            alt={`${store.name} 料理`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 店舗紹介 */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-sm text-gray-700 leading-relaxed">{store.description}</div>
      </div>

      {/* クーポンボタン */}
      <div className="pt-2">
        <button
          onClick={() => onCouponsClick(store.id)}
          className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          <Ticket className="w-5 h-5" />
          <span className="font-medium">クーポンを見る</span>
        </button>
      </div>
    </div>
  )
}