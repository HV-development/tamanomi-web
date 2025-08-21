"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function Logo({ size = "md", className = "", onClick }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  const Component = onClick ? "button" : "div"

  return (
    <Component
      onClick={onClick}
      className={`flex items-center ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`}
    >
      <img 
        src="/logo.png" 
        alt="TAMAYOI" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </Component>
  )
}
