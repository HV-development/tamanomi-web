"use client"

interface AreaButtonProps {
  label: string
  isSelected: boolean
  onClick: () => void
  className?: string
}

export function AreaButton({ label, isSelected, onClick, className = "" }: AreaButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center w-full ${
        isSelected
          ? "border-green-600 bg-green-50 text-green-700 shadow-md"
          : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-sm"
      } block ${className}`}
    >
      <span className="block">{label}</span>
    </button>
  )
}
