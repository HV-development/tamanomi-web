"use client"

import { useState, useEffect } from "react"
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
      fallbackEmoji: "🥉",
    },
    silver: {
      label: "シルバー",
      color: "text-gray-700",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300",
      fallbackEmoji: "🥈",
    },
    gold: {
      label: "ゴールド",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      fallbackEmoji: "🥇",
    },
    diamond: {
      label: "ダイヤモンド",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      fallbackEmoji: "💎",
    },
  }

  const config = rankConfig[rank]

  const sizeClasses = {
    sm: {
      container: "px-2 py-1",
      text: "text-xs",
      emoji: "text-lg",
    },
    md: {
      container: "px-3 py-1.5",
      text: "text-sm",
      emoji: "text-2xl",
    },
    lg: {
      container: "px-4 py-2",
      text: "text-base",
      emoji: "text-3xl",
    },
  }

  const sizeClass = sizeClasses[size]

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeClass.container} ${className}`}
    >
      {/* 絵文字アイコン表示 */}
      <div className="flex items-center justify-center">
        <span className={`${sizeClass.emoji}`}>{config.fallbackEmoji}</span>
      </div>

      {showLabel && <span className={`font-bold ${config.color} ${sizeClass.text}`}>{config.label}</span>}
    </div>
  )
}