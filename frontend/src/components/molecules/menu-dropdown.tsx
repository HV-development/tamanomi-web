"use client"

import { ChevronRight } from "lucide-react"

interface MenuItem {
  id: string
  label: string
  onClick: () => void
}

interface MenuDropdownProps {
  isOpen: boolean
  onClose: () => void
  items: MenuItem[]
  className?: string
}

export function MenuDropdown({ isOpen, onClose, items, className = "" }: MenuDropdownProps) {
  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={onClose}></div>

      {/* ドロップダウンメニュー */}
      <div
        className={`absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}
      >
        <div className="py-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick()
                onClose()
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <span className="text-gray-700 font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
