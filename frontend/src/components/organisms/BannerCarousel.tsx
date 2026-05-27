"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BannerItem {
  id: string
  imageUrl: string
  linkUrl: string
  alt: string
}

interface BannerCarouselProps {
  className?: string
}

const banners: BannerItem[] = [
  {
    id: "banner-1",
    imageUrl: "/merchant-recruitment-user.jpg",
    linkUrl: "https://www.tamanomi.com/lp/merchant",
    alt: "掲載店募集"
  },
  // 2026/5/31 キャンペーン終了に伴い非表示
  // {
  //   id: "banner-2",
  //   imageUrl: "/saitama-app-benefits-user.png",
  //   linkUrl: "https://www.home.saitama-tsunagu.com/",
  //   alt: "さいたま市みんなのアプリ（ユーザー特典）"
  // },
  {
    id: "banner-2",
    imageUrl: "/instagram-official-user.png",
    linkUrl: "https://www.instagram.com/tamanomi.saitama?igsh=dTdnb2gxNGFnOWs=",
    alt: "公式 Instagram たまのみ部がゆく"
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

  const handleBannerClick = () => {
    const isExternal = currentBanner.linkUrl.startsWith('http')
    if (isExternal) {
      window.open(currentBanner.linkUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.open(currentBanner.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-none ${className}`}>
      {/* バナー表示エリア（横長 3:1 固定） */}
      <div className="relative w-full aspect-[3/1] overflow-hidden">
        {/* バナー画像 */}
        <div 
          className="absolute inset-0 cursor-pointer transition-all duration-500"
          onClick={handleBannerClick}
        >
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.alt}
            fill
            className="object-cover"
          />
        </div>

        {/* 左矢印ボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/40 hover:bg-white/60 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="前のバナー"
        >
          <ChevronLeft className="w-4 h-4 text-gray-800" />
        </button>

        {/* 右矢印ボタン */}
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/40 hover:bg-white/60 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="次のバナー"
        >
          <ChevronRight className="w-4 h-4 text-gray-800" />
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
                  ? "bg-white scale-125 shadow-md"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`バナー ${index + 1} に移動`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
