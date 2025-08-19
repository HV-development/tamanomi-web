"use client"

import { Wine } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function Logo({ size = "md", className = "", onClick }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const Component = onClick ? "button" : "div"

  return (
    <Component
      onClick={onClick}
      className={`flex items-center gap-2 ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`}
    >
      <div className="relative">
        <Wine className="w-6 h-6 text-green-600" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-green-700 leading-tight ${sizeClasses[size]}`}>TAMAYOI</span>
        <span className="text-xs text-green-600 font-medium -mt-1">たまよい</span>
      </div>
    </Component>
  )
}
