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
      className={`rounded-lg border-2 transition-all duration-200 active:scale-[0.98] active:bg-gray-100 text-center w-full ${
        isSelected
          ? "border-green-700 bg-green-100 text-green-800 shadow-md"
          : "border-gray-300 bg-white text-gray-700"
      } block ${className}`}
    >
      <span className="block">{label}</span>
    </button>
  )
}
