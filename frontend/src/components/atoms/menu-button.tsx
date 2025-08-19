"use client"

import { ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MenuButtonProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  onClick: () => void
  variant?: "default" | "danger"
  className?: string
}

export function MenuButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  variant = "default",
  className = "",
}: MenuButtonProps) {
  const variantStyles = {
    default: "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200",
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors duration-200 ${variant === "danger" ? "bg-red-100 group-hover:bg-red-200" : "bg-green-100 group-hover:bg-green-200"}`}>
          <Icon className={`w-5 h-5 transition-colors duration-200 ${variant === "danger" ? "text-red-600 group-hover:text-red-700" : "text-green-600 group-hover:text-green-700"}`} />
        </div>
        <div className="text-left">
          <div className="font-medium transition-colors duration-200">{title}</div>
          {subtitle && <div className="text-sm text-gray-500 transition-colors duration-200">{subtitle}</div>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 transition-all duration-200 group-hover:text-green-600 group-hover:translate-x-1" />
    </button>
  )
}
