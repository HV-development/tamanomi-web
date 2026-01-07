"use client"

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending"
  text: string
  className?: string
}

export function StatusBadge({ status, text, className = "" }: StatusBadgeProps) {
  const statusStyles = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]} ${className}`}
    >
      {text}
    </span>
  )
}
