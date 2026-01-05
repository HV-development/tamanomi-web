/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { Store } from "@/types/store"

interface StoreDetailPopupProps {
  isOpen: boolean
  store: Store | null
  onClose: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
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

export function StoreDetailPopup({
  isOpen,
  store,
  onClose,
  onCouponsClick
}: StoreDetailPopupProps) {
  if (!isOpen || !store) return null

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageError, setIsImageError] = useState(false)

  // 画像配列を作成
  const images = [
    store.thumbnailUrl || "",
    getStoreInteriorImage(store.genre),
    getStoreFoodImage(store.genre)
  ]

  const hasThumbnail = Boolean(store.thumbnailUrl)
  const shouldShowPlaceholder = !hasThumbnail || isImageError

  // 写真クリックで次の写真に切り替え
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

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
              {/* 店舗写真 */}
              <div className="relative overflow-hidden">
                {shouldShowPlaceholder ? (
                  <div className="w-full aspect-[4/3] rounded-lg border border-gray-300 bg-gray-200 flex items-center justify-center">
                    <span className="text-black text-sm">no image</span>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-full aspect-[4/3] cursor-pointer select-none relative rounded-lg overflow-hidden"
                      onClick={handleImageClick}
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
                    {images.length > 1 && (
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
                    )}
                  </>
                )}
              </div>

              {/* ホームページURL（一番上） */}
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

              {/* 店舗詳細（ホームページURLの下） */}
              {store.details && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">店舗詳細</div>
                  <div className="text-base text-gray-700 whitespace-pre-line">{store.details}</div>
                </div>
              )}

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

              {/* 定休日 */}
              {(store.closedDays || store.holidays) && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">定休日</div>
                  <div className="text-base text-gray-700">{store.closedDays || store.holidays}</div>
                </div>
              )}

              {/* 支払い方法 */}
              {store.paymentMethods && (() => {
                const hasSaicoin = store.paymentMethods.saicoin
                const hasTamapon = store.paymentMethods.tamapon
                const hasDigitalCurrency = hasSaicoin || hasTamapon
                const hasCreditCards = store.paymentMethods.creditCards && store.paymentMethods.creditCards.length > 0
                const hasDigitalPayments = store.paymentMethods.digitalPayments && store.paymentMethods.digitalPayments.length > 0
                const hasOther = hasDigitalPayments

                // クレジットカードの表示名マッピング
                const creditCardNames: Record<string, string> = {
                  'VISA': 'VISA',
                  'Master': 'Master',
                  'JCB': 'JCB',
                  'AMEX': 'AMEX',
                  'Diners': 'Diners',
                }

                // デジタル決済の表示名マッピング
                const digitalPaymentNames: Record<string, string> = {
                  '交通系マネー': '交通系マネー',
                  'PayPay': 'PayPay',
                  '楽天Pay': '楽天Pay',
                  'イオンPay': 'イオンPay',
                  'd払い': 'd払い',
                  'au Pay': 'au Pay',
                }

                if (!hasDigitalCurrency && !hasCreditCards && !hasOther) {
                  return null
                }

                return (
                  <div className="space-y-2">
                    <div className="text-base font-bold text-gray-900">支払方法</div>
                    <div className="space-y-1">
                      {/* さいたま市デジタル地域通貨 */}
                      {hasDigitalCurrency && (
                        <div className="text-base text-gray-700">
                          さいたま市デジタル地域通貨（{[
                            hasSaicoin && 'さいコイン',
                            hasTamapon && 'たまポン'
                          ].filter(Boolean).join('　')}）
                        </div>
                      )}

                      {/* クレジットカード */}
                      {hasCreditCards && (
                        <div className="text-base text-gray-700">
                          クレジットカード（{store.paymentMethods.creditCards!
                            .map(card => creditCardNames[card] || card)
                            .join('　')}）
                        </div>
                      )}

                      {/* その他 */}
                      {hasOther && (
                        <div className="text-base text-gray-700">
                          その他（{store.paymentMethods.digitalPayments!
                            .map(payment => digitalPaymentNames[payment] || payment)
                            .join('　')}）
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* 利用時間 */}
              {store.couponUsageStart && store.couponUsageEnd && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">利用時間</div>
                  <div className="text-base text-gray-700">
                    {/* クーポン利用可能曜日 */}
                    {store.couponUsageDays && store.couponUsageDays.length > 0 && (
                      <span>{store.couponUsageDays.split(',').filter(Boolean).map(d => d.trim()).join(' ')} </span>
                    )}
                    {`${store.couponUsageStart}〜${store.couponUsageEnd}`}
                  </div>
                </div>
              )}

              {/* 利用シーン */}
              {store.usageScenes && store.usageScenes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">利用シーン</div>
                  <div className="text-base text-gray-700">
                    {store.usageScenes.join('　')}
                  </div>
                </div>
              )}

              {/* 具体的な利用シーン */}
              {store.customSceneText && store.customSceneText.trim() && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">具体的な利用シーン</div>
                  <div className="text-base text-gray-700">
                    {store.customSceneText}
                  </div>
                </div>
              )}

              {/* 喫煙タイプ（利用シーンの下） */}
              {store.smokingPolicy && (
                <div className="space-y-2">
                  <div className="text-base font-bold text-gray-900">喫煙タイプ</div>
                  <div className="text-base text-gray-700">{getSmokingPolicyText(store.smokingPolicy)}</div>
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