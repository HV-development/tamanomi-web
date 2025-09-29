"use client"

import type React from "react"

import { MapPin } from "lucide-react"

interface ButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "location"
  className?: string
}

export function Button({ children, onClick, type = "button", variant = "primary", className = "" }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🔍 Button clicked:", children)
    if (onClick) {
      console.log("🔍 Button onClick handler exists, calling it")
      onClick(e)
    } else {
      console.log("🔍 Button onClick handler is undefined")
    }
  }

  const baseClasses =
    "px-3 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap"

  const variantClasses = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-green-500",
    location:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-green-500",
  }

  return (
    <button type={type} onClick={handleClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}