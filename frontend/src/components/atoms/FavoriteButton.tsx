"use client"

import { Heart } from "lucide-react"

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  className?: string
}

export function FavoriteButton({ isFavorite, onToggle, className = "" }: FavoriteButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle()
  }

  const heartClassName = isFavorite
    ? "w-3.5 h-3.5 transition-colors text-red-500 fill-red-500"
    : "w-3.5 h-3.5 transition-colors text-gray-400 hover:text-red-500"

  return (
    <button
      onClick={handleClick}
      className={`p-2 bg-white hover:bg-gray-50 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-200 ${className}`}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Heart
        className={heartClassName}
      />
    </button>
  )
}
