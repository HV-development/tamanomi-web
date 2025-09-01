"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  backgroundColor: string
  textColor: string
}

interface BannerCarouselProps {
  className?: string
}

const banners: Banner[] = [
  {
    id: "banner-1",
    title: "おいしい酒場。",
    subtitle: "さいたまの夜を彩る特別な一杯",
    imageUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    backgroundColor: "bg-gradient-to-r from-orange-600 to-red-600",
    textColor: "text-white"
  },
  {
    id: "banner-2", 
    title: "新店舗オープン！",
    subtitle: "大宮駅前に新しいイタリアンレストラン",
    imageUrl: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    backgroundColor: "bg-gradient-to-r from-green-600 to-blue-600",
    textColor: "text-white"
  },
  {
    id: "banner-3",
    title: "週末限定キャンペーン",
    subtitle: "金土日はドリンク2杯目半額",
    imageUrl: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg",
    backgroundColor: "bg-gradient-to-r from-purple-600 to-pink-600", 
    textColor: "text-white"
  }
]

export function BannerCarousel({ className = "" }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // 自動スライド
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    // 5秒後に自動再生を再開
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    // 5秒後に自動再生を再開
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
    // 5秒後に自動再生を再開
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* バナー表示エリア */}
      <div className="relative h-32 overflow-hidden">
        {/* バナー画像とコンテンツ */}
        <div 
          className={`absolute inset-0 ${currentBanner.backgroundColor} transition-all duration-500`}
        >
          {/* 背景画像 */}
          <div className="absolute inset-0 opacity-30">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* グラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* テキストコンテンツ */}
          <div className="relative z-10 flex items-center justify-center h-full px-6">
            <div className="text-center">
              <h2 className={`text-xl font-bold mb-1 ${currentBanner.textColor} drop-shadow-lg`}>
                {currentBanner.title}
              </h2>
              <p className={`text-sm ${currentBanner.textColor} opacity-90 drop-shadow-md`}>
                {currentBanner.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 左矢印ボタン */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="前のバナー"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        {/* 右矢印ボタン */}
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="次のバナー"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* インジケーター */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`バナー ${index + 1} に移動`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}