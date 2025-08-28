"use client"

import { GenreButton } from "../atoms/genre-button"
import { Button } from "../atoms/button"
import { getGenreColor } from "../../utils/genre-colors"

interface GenrePopupProps {
  isOpen: boolean
  selectedGenres: string[]
  selectedEvents: string[]
  onGenreToggle: (genre: string) => void
  onEventToggle: (event: string) => void
  onClose: () => void
  onClear: () => void
}

const GENRES = [
  { value: "izakaya", label: "居酒屋" },
  { value: "creative", label: "創作料理" },
  { value: "japanese", label: "和食" },
  { value: "western", label: "洋食" },
  { value: "italian", label: "イタリアン" },
  { value: "french", label: "フレンチ" },
  { value: "chinese", label: "中華" },
  { value: "yakiniku", label: "焼肉" },
  { value: "korean", label: "韓国料理" },
  { value: "asian", label: "アジアン" },
  { value: "bar", label: "バー" },
  { value: "ramen", label: "ラーメン" },
  { value: "soba", label: "そば" },
  { value: "udon", label: "うどん" },
]

const EVENTS = [
  { value: "date", label: "デート" },
  { value: "business", label: "接待" },
  { value: "friends", label: "友人と" },
  { value: "family", label: "家族と" },
  { value: "solo", label: "おひとり様" },
  { value: "group", label: "グループ" },
  { value: "party", label: "宴会" },
  { value: "celebration", label: "お祝い" },
  { value: "casual", label: "カジュアル" },
  { value: "formal", label: "フォーマル" },
  { value: "lunch", label: "ランチ" },
  { value: "dinner", label: "ディナー" },
]
export function GenrePopup({ isOpen, selectedGenres, selectedEvents, onGenreToggle, onEventToggle, onClose, onClear }: GenrePopupProps) {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40" 
        onClick={handleOverlayClick}
      ></div>

      {/* ポップアップ */}
      <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 max-w-lg mx-auto max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">ジャンル・イベントを選択</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4">複数選択可能です</div>

          <div className="max-h-96 overflow-y-auto mb-6">
            {/* ジャンルセクション */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-800 mb-3">ジャンル</h4>
              <div className="grid grid-cols-2 gap-3">
                {GENRES.map((genre) => {
                  const genreColors = getGenreColor(genre.value)
                  const isSelected = selectedGenres.includes(genre.value)
                  
                  return (
                    <button
                      key={genre.value}
                      onClick={() => onGenreToggle(genre.value)}
                      className={`relative rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center w-full text-sm py-3 px-2 min-h-[44px] flex items-center justify-center font-medium ${
                        isSelected
                          ? `${genreColors.border} ${genreColors.bg} ${genreColors.text} shadow-md`
                         : `border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-sm`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${genreColors.text.replace('text-', 'bg-')}`}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                      <span className="block">{genre.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* イベントセクション */}
            <div>
              <h4 className="text-md font-bold text-gray-800 mb-3">イベント・シーン</h4>
              <div className="grid grid-cols-2 gap-3">
                {EVENTS.map((event) => {
                  const isSelected = selectedEvents.includes(event.value)
                  
                  return (
                    <button
                      key={event.value}
                      onClick={() => onEventToggle(event.value)}
                      className={`relative rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center w-full text-sm py-3 px-2 min-h-[44px] flex items-center justify-center font-medium ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                      <span className="block">{event.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClear} variant="secondary" className="flex-1">
              クリア
            </Button>
            <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              完了（{selectedGenres.length + selectedEvents.length}件選択）
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
