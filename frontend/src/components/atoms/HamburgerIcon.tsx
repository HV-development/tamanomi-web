"use client"

import { Menu, X } from "lucide-react"

interface HamburgerIconProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function HamburgerIcon({ isOpen, onClick, className = "" }: HamburgerIconProps) {
  return (
    <button onClick={onClick} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}>
      {isOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
    </button>
  )
}
