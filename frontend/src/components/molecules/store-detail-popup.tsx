"use client"

import { X, MapPin, Phone, Globe, Ticket, Clock, Calendar, JapaneseYen, Cigarette, CreditCard, Users } from "lucide-react"
import { FavoriteButton } from "../atoms/favorite-button"
import { getGenreColor } from "../../utils/genre-colors"
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

  // 喫煙ポリシーのテキスト変換
  const getSmokingPolicyText = (policy: string) => {
    switch (policy) {
      case 'NON_SMOKING':
        return 'NON_SMOKING（禁煙席）'
      case 'SMOKING':
        return '喫煙席'
      case 'SEPARATED':
        return '分煙／エリア分け'
      case 'HEATED_TOBACCO':
        return '加熱式専用'
      case 'UNKNOWN':
      case 'UNSPECIFIED':
      default:
        return '未設定／不明'
    }
  }

  // 予算のフォーマット
  const formatBudget = (budget: { min: number; max: number }) => {
    return `¥${budget.min.toLocaleString()} 〜 ¥${budget.max.toLocaleString()}`
  }

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose}>
      </div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-2xl shadow-xl z-50 max-w-md mx-auto overflow-hidden border border-gray-200">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="w-8"></div>
              <h3 className="text-xl font-bold text-white">店舗詳細</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* 店舗名表示 */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="text-left">
              <h4 className="text-lg font-bold text-gray-900">{store.name}</h4>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="space-y-4">
              {/* 営業時間 */}
              {store.businessHours && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">営業時間</div>
                  <div className="text-base text-gray-700">{store.businessHours}</div>
                </div>
              )}

              {/* 定休日 */}
              {store.closedDays && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">定休日</div>
                  <div className="text-base text-gray-700">{store.closedDays}</div>
                </div>
              )}

              {/* 予算 */}
              {store.budget && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">予算</div>
                  <div className="space-y-1">
                    {store.budget.dinner && (
                      <div className="text-base text-gray-700">
                        夜：{formatBudget(store.budget.dinner)}
                      </div>
                    )}
                    {store.budget.lunch && (
                      <div className="text-base text-gray-700">
                        昼：{formatBudget(store.budget.lunch)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 禁煙・喫煙 */}
              {store.smokingPolicy && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">禁煙・分煙</div>
                  <div className="text-base text-gray-700">{getSmokingPolicyText(store.smokingPolicy)}</div>
                </div>
              )}

              {/* 支払い方法 */}
              {store.paymentMethods && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">支払い方法</div>
                  <div className="space-y-1">
                    {/* 現金 */}
                    <div className="text-base text-gray-700">
                      現金：{store.paymentMethods.cash ? '可' : '不可'}
                    </div>
                    
                    {/* クレジットカード */}
                    {store.paymentMethods.creditCards.length > 0 && (
                      <div className="text-base text-gray-700">
                        クレジットカード：{store.paymentMethods.creditCards.join('、')}
                      </div>
                    )}
                    
                    {/* コード決済 */}
                    {store.paymentMethods.digitalPayments.length > 0 && (
                      <div className="text-base text-gray-700">
                        コード決済：{store.paymentMethods.digitalPayments.join('、')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 利用シーン */}
              {store.usageScenes && store.usageScenes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-base font-bold text-gray-900 mb-2">利用シーン</div>
                  <div className="text-base text-gray-700">{store.usageScenes.join('、')}</div>
                </div>
              )}

              {/* クーポンボタン */}
              <div className="pt-2">
                <button
                  onClick={() => onCouponsClick(store.id)}
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  <span className="font-medium">クーポン一覧</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}