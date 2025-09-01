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
      className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md ${
        isFavorite
          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
          : "text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200"
      } ${className}`}
    >
      <Heart 
        className={`w-5 h-5 transition-colors ${
          isFavorite 
            ? "text-red-500 fill-red-500" 
            : "text-gray-400"
        }`}
      />
    </button>
  )
}
