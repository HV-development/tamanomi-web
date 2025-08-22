"use client"

import { X, MapPin, Phone, Globe, Ticket, Clock, Calendar } from "lucide-react"
import { FavoriteButton } from "../atoms/favorite-button"
import type { Store } from "../../types/store"

interface StoreDetailPopupProps {
  isOpen: boolean
  store: Store | null
  onClose: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
}

export function StoreDetailPopup({ 
  isOpen, 
  store, 
  onClose, 
  onFavoriteToggle, 
  onCouponsClick 
}: StoreDetailPopupProps) {
  if (!isOpen || !store) return null

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

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-2xl z-50 max-w-md mx-auto overflow-hidden border-2 border-green-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 text-white flex-shrink-0 relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">店舗詳細</h3>
                    <p className="text-green-100 text-sm font-medium opacity-90">詳細情報</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {/* 店舗名とお気に入り */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h2>
              </div>

              {/* 店舗写真3枚横並び */}
              <div className="grid grid-cols-3 gap-1">
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

              {/* 店舗紹介文 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-3">店舗紹介</h4>
                <p className="text-gray-700 leading-relaxed">{store.description}</p>
              </div>

              {/* 店舗情報 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">店舗情報</h4>
                
                {/* 住所 */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">住所</div>
                    <div className="text-gray-900">{store.address}</div>
                    <button
                      onClick={handleMapClick}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-1 underline"
                    >
                      Googleマップで表示
                    </button>
                  </div>
                </div>

                {/* 電話番号 */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">電話番号</div>
                    <button
                      onClick={handlePhoneClick}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {store.phone}
                    </button>
                  </div>
                </div>

                {/* 営業時間 */}
                {store.businessHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">営業時間</div>
                      <div className="text-gray-900">{store.businessHours}</div>
                    </div>
                  </div>
                )}

                {/* 定休日 */}
                {store.closedDays && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">定休日</div>
                      <div className="text-gray-900">{store.closedDays}</div>
                    </div>
                  </div>
                )}

                {/* ウェブサイト */}
                {store.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-1">ウェブサイト</div>
                      <button
                        onClick={handleWebsiteClick}
                        className="text-blue-600 hover:text-blue-700 underline break-all"
                      >
                        公式サイトを見る
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* クーポン一覧ボタン */}
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => onCouponsClick(store.id)}
                  className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  <Ticket className="w-6 h-6" />
                  <span className="font-bold text-lg">クーポン一覧</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}