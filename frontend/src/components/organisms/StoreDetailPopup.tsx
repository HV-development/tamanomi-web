/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { X } from "lucide-react"
import type { Store } from "@/types/store"

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
  onCouponsClick 
}: StoreDetailPopupProps) {
  if (!isOpen || !store) return null

  // 喫煙ポリシーのテキスト変換
  const getSmokingPolicyText = (policy: string) => {
    switch (policy) {
      case 'NON_SMOKING':
        return '禁煙席'
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

  // 住所クリックでGoogleマップに遷移
  const handleAddressClick = () => {
    // 座標が登録されている場合は座標で検索、ない場合は住所で検索
    if (store.latitude && store.longitude) {
      const googleMapsUrl = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`
      window.open(googleMapsUrl, '_blank')
    } else {
      const query = encodeURIComponent(`${store.name} ${store.address}`)
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
      window.open(googleMapsUrl, '_blank')
    }
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
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 店舗名表示 */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-900">{store.name}</h4>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* 住所 */}
              {store.address && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">住所</div>
                  <button
                    onClick={handleAddressClick}
                    className="text-base text-green-700 hover:text-green-800 underline text-left"
                  >
                    {store.address}
                  </button>
                </div>
              )}

              {/* 電話番号 */}
              {store.phone && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">電話番号</div>
                  <a
                    href={`tel:${store.phone}`}
                    className="text-base text-green-700 hover:text-green-800 underline"
                  >
                    {store.phone}
                  </a>
                </div>
              )}

              {/* ホームページURL */}
              {(store.homepageUrl || store.website) && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">ホームページURL</div>
                  <a
                    href={store.homepageUrl || store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-green-700 hover:text-green-800 underline break-all"
                  >
                    {store.homepageUrl || store.website}
                  </a>
                </div>
              )}

              {/* 詳細情報 */}
              {store.details && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">詳細情報</div>
                  <div className="text-base text-gray-700 whitespace-pre-line">{store.details}</div>
                </div>
              )}

              {/* 定休日 */}
              {(store.closedDays || store.holidays) && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">定休日</div>
                  <div className="text-base text-gray-700">{store.closedDays || store.holidays}</div>
                </div>
              )}

              {/* 禁煙・分煙 */}
              {store.smokingPolicy && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">禁煙・分煙</div>
                  <div className="text-base text-gray-700">{getSmokingPolicyText(store.smokingPolicy)}</div>
                </div>
              )}

              {/* 支払い方法 */}
              {store.paymentMethods && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">支払方法</div>
                  <div className="space-y-1">
                    {/* さいコイン */}
                    <div className="text-base text-gray-700">
                      さいコイン：{store.paymentMethods.saicoin ? '可' : '不可'}
                    </div>
                    
                    {/* たまポン */}
                    <div className="text-base text-gray-700">
                      たまポン：{store.paymentMethods.tamapon ? '可' : '不可'}
                    </div>
                    
                    {/* 現金 */}
                    <div className="text-base text-gray-700">
                      現金：{store.paymentMethods.cash ? '可' : '不可'}
                    </div>
                    
                    {/* クレジットカード */}
                    {store.paymentMethods.creditCards && store.paymentMethods.creditCards.length > 0 && (
                      <div className="text-base text-gray-700">
                        クレジットカード：可　{store.paymentMethods.creditCards.join('、')}
                      </div>
                    )}
                    
                    {/* コード決済 */}
                    {store.paymentMethods.digitalPayments && store.paymentMethods.digitalPayments.length > 0 && (
                      <div className="text-base text-gray-700">
                        コード決済：可　{store.paymentMethods.digitalPayments.join('、')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 利用時間 */}
              {store.couponUsageStart && store.couponUsageEnd && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">利用時間</div>
                  <div className="text-base text-gray-700">{`${store.couponUsageStart}〜${store.couponUsageEnd}`}</div>
                </div>
              )}

              {/* クーポン利用可能曜日 */}
              {store.couponUsageDays && store.couponUsageDays.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">利用可能曜日</div>
                  <div className="text-base text-gray-700">
                    {store.couponUsageDays.split(',').map(d => `${d}曜日`).join('、')}
                  </div>
                </div>
              )}

              {/* 利用シーン */}
              {store.usageScenes && store.usageScenes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">利用シーン</div>
                  <div className="text-base text-gray-700">{store.usageScenes.join('、')}</div>
                </div>
              )}

              {/* クーポンボタン */}
              <div className="pt-2">
                <button
                  onClick={() => onCouponsClick(store.id)}
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  <span className="font-medium">今すぐクーポンGET</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}