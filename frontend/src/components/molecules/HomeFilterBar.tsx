"use client"

interface HomeFilterBarProps {
  isNearbyFilter: boolean
  selectedAreasCount: number
  selectedGenresCount: number
  onCurrentLocationClick: () => void
  onAreaClick: () => void
  onGenreClick: () => void
}

const filterButtonBase =
  "w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#2B7A78] focus:border-[#2B7A78]"

/**
 * 店舗一覧のフィルターボタン（近くのお店・エリア・ジャンル）と特定商取引法リンク。
 */
export function HomeFilterBar({
  isNearbyFilter,
  selectedAreasCount,
  selectedGenresCount,
  onCurrentLocationClick,
  onAreaClick,
  onGenreClick,
}: HomeFilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="grid grid-cols-3 gap-1 px-2 py-4">
        <button
          onClick={onCurrentLocationClick}
          className={`${filterButtonBase} ${isNearbyFilter
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
            }`}
        >
          {isNearbyFilter && <span className="text-green-600 text-xs">✓</span>}
          近くのお店
        </button>
        <button
          onClick={(e) => {
            ;(e.currentTarget as HTMLButtonElement).blur()
            onAreaClick()
          }}
          className={`${filterButtonBase} active:bg-gray-100 ${selectedAreasCount > 0
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-300 bg-white text-gray-700"
            }`}
        >
          <span>エリア</span>
          {selectedAreasCount > 0 && (
            <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
              {selectedAreasCount}
            </span>
          )}
        </button>
        <button
          onClick={(e) => {
            ;(e.currentTarget as HTMLButtonElement).blur()
            onGenreClick()
          }}
          className={`${filterButtonBase} active:bg-gray-100 ${selectedGenresCount > 0
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-300 bg-white text-gray-700"
            }`}
        >
          <span>ジャンル</span>
          {selectedGenresCount > 0 && (
            <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
              {selectedGenresCount}
            </span>
          )}
        </button>
      </div>
      <div className="px-2 pb-2 text-center">
        <a
          href="/lp/commercial-law"
          className="text-xs text-gray-600 hover:text-gray-800 underline"
        >
          特定商取引法について
        </a>
      </div>
    </div>
  )
}
