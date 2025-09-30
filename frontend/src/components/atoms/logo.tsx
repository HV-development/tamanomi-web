"use client"

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

  const baseClassName = `flex items-center ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClassName}
      >
        <img
          src="/logo.svg"
          alt="TAMAYOI"
          className={`${sizeClasses[size]} object-contain`}
        />
      </button>
    )
  }

  return (
    <div className={baseClassName}>
      <img
        src="/logo.svg"
        alt="TAMAYOI"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  )
}
