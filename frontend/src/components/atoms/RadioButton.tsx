"use client"

interface RadioOption {
  value: string
  label: string
}

interface RadioButtonProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  className?: string
}

export function RadioButton({
  options,
  value,
  onChange,
  label,
  error,
  className = "",
}: RadioButtonProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-2 py-3 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium transition-all duration-200 min-w-0 ${value === option.value
              ? "bg-green-50 text-green-700 border-green-500"
              : "bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
              }`}
          >
            <span className="truncate block">{option.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}