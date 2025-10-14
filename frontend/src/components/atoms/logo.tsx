"use client"

import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function Logo({ size = "md", className = "", onClick }: LogoProps) {
  const sizeClasses = {
    sm: "h-4",
    md: "h-6",
    lg: "h-8",
  }

  const WrapperComponent = onClick ? "button" : "div"

  const pixelSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  }

  return (
    <WrapperComponent
      onClick={onClick}
      className={`flex items-center ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`}
    >
      <Image 
        src="/logo.svg"
        alt="TAMAYOI" 
        width={pixelSizes[size] * 6}
        height={pixelSizes[size]}
        className={`${sizeClasses[size]} object-contain`}
      />
    </WrapperComponent>
  )
}
