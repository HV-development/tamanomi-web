"use client"

import { Check } from "lucide-react"
import { getGenreColor } from "../../utils/genre-colors"

interface GenreButtonProps {
  label: string
  genre: string
  isSelected: boolean
  onClick: () => void
  className?: string
}

export function GenreButton({ label, genre, isSelected, onClick, className = "" }: GenreButtonProps) {
  const genreColors = getGenreColor(genre)
  
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg border-2 transition-all duration-200 text-center w-full ${
        isSelected
          ? `border-green-600 ${genreColors.bg} ${genreColors.text} shadow-md`
          : `border-gray-300 bg-white text-gray-700 ${genreColors.hover} hover:border-gray-400`
      } block ${className}`}
    >
      {isSelected && (
        <div className="absolute -top-1 -right-1">
          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${genreColors.text.replace('text-', 'bg-')}`}>
            <Check className="w-2 h-2 text-white" />
          </div>
        </div>
      )}
      <span className="block">{label}</span>
    </button>
  )
}
