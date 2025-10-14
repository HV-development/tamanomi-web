"use client"

import Image from "next/image"
import type { UserRank } from "../../types/user"

interface RankBadgeProps {
  rank: UserRank
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function RankBadge({ rank, size = "md", showLabel = true, className = "" }: RankBadgeProps) {
  const rankConfig = {
    bronze: {
      label: "ブロンズ",
      color: "text-amber-700",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-300",
      image: "/bronze.png",
    },
    silver: {
      label: "シルバー",
      color: "text-gray-700",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300",
      image: "/silver.png",
    },
    gold: {
      label: "ゴールド",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      image: "/gold.png",
    },
    diamond: {
      label: "ダイヤモンド",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      image: "/diamond.png",
    },
  }

  const config = rankConfig[rank]

  const sizeClasses = {
    sm: {
      container: "px-2 py-1",
      text: "text-xs",
      emoji: "text-lg",
      imageSize: "w-4 h-4",
      imageWidth: "16px",
      imageHeight: "16px",
    },
    md: {
      container: "px-3 py-1.5",
      text: "text-sm",
      emoji: "text-2xl",
      imageSize: "w-6 h-6",
      imageWidth: "24px",
      imageHeight: "24px",
    },
    lg: {
      container: "px-4 py-2",
      text: "text-base",
      emoji: "text-3xl",
      imageSize: "w-12 h-12",
      imageWidth: "48px",
      imageHeight: "48px",
    },
  }

  const sizeClass = sizeClasses[size]

  return (
    <div
        className={`inline-flex items-center justify-start gap-2 text-left ${sizeClass.container} ${className}`}
    >
      {/* ランク画像または絵文字アイコン表示 */}
      <div className="flex items-center justify-center flex-shrink-0">
        {config.image && rank !== "diamond" ? (
          <div className={`relative ${sizeClass.imageSize}`}>
            <Image
              src={config.image}
              alt={`${config.label}ランク`}
              width={parseInt(sizeClass.imageWidth)}
              height={parseInt(sizeClass.imageHeight)}
              className="object-contain"
            />
          </div>
        ) : (
          <span className={`${sizeClass.emoji} flex-shrink-0`}>🥉</span>
        )}
      </div>

      {showLabel && (
        <span className={`font-bold ${config.color} ${sizeClass.text} flex-shrink-0 text-left`}>
          {config.label}
        </span>
      )}
    </div>
  )
}