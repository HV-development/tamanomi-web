"use client"

import { Heart } from "lucide-react"

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  className?: string
}

export function FavoriteButton({ isFavorite, onToggle, className = "" }: FavoriteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 transition-all duration-300 transform hover:scale-110 ${className}`}
    >
      <Heart 
        className={`w-6 h-6 transition-colors ${
          isFavorite 
            ? "text-red-500 fill-red-500" 
            : "text-gray-400 hover:text-red-500"
        }`}
      />
    </button>
  )
}
