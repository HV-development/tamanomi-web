"use client"

import { useState } from "react"
import { Search as SearchIcon, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (keyword: string) => void
  onClose?: () => void
  isLoading?: boolean
  className?: string
}

export function SearchBar({ onSearch, onClose, isLoading = false, className = "" }: SearchBarProps) {
  const [searchKeyword, setSearchKeyword] = useState("")

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      return
    }
    onSearch(searchKeyword.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`bg-white border-b border-gray-100 px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="店名で検索"
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchKeyword.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          検索
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="検索を閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

