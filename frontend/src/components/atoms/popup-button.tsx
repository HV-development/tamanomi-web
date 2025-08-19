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
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
      } ${className}`}
    >
      <span className="truncate">{label}</span>
      {selectedCount > 0 && (
        <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
          {selectedCount}
        </span>
      )}
      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
    </button>
  )
}
