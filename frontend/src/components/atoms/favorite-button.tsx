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
      className={`p-1.5 bg-white hover:bg-gray-50 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-200 ${className}`}
    >
      <Heart 
        className={`w-3.5 h-3.5 transition-colors ${
          isFavorite 
            ? "text-red-500 fill-red-500" 
            : "text-gray-400 hover:text-red-500"
        }`}
      />
    </button>
  )
}
