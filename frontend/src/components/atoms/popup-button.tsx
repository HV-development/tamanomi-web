"use client"

import { ChevronDown } from "lucide-react"

interface PopupButtonProps {
  label: string
  selectedCount?: number
  onClick: () => void
  className?: string
}

export function PopupButton({ label, selectedCount = 0, onClick, className = "" }: PopupButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 border rounded-full text-sm font-medium transition-colors whitespace-nowrap min-w-0 ${
        selectedCount > 0
          ? "border-green-700 bg-green-100 text-green-800"
          : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-100"
      } ${className}`}
    >
      <span className="truncate">{label}</span>
      {selectedCount > 0 && (
        <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
          {selectedCount}
        </span>
      )}
      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
    </button>
  )
}
