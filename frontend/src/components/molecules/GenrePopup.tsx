"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/atoms/Button"
import { getGenreBackgroundClass, getGenreBackgroundStyle, getGenreBorderClass, getGenreBorderStyle, getGenreCheckBgClass, getGenreCheckBgStyle, getGenreColorByName, getGenreHoverClass, getGenreHoverStyle, getGenreTextClass, getGenreTextStyle } from "@/utils/genre-colors"
import { cn } from "@/lib/utils"

interface GenrePopupProps {
  isOpen: boolean
  selectedGenres: string[]
  onGenreToggle: (genre: string) => void
  onClose: () => void
  onClear: () => void
}

interface Genre {
  id: string
  name: string
  sortOrder: number
}

let genreCache: Genre[] | null = null
let genreFetchPromise: Promise<Genre[]> | null = null

async function loadGenres(): Promise<Genre[]> {
  if (genreCache) return genreCache
  if (genreFetchPromise) return genreFetchPromise

  genreFetchPromise = fetch('/api/genres', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('ジャンル一覧の取得に失敗しました')
      }

      const data = await response.json()
      const genresArray = Array.isArray(data) ? data : (data.genres || [])
      const sortedGenres = genresArray
        .filter((g: Genre) => g && g.id && g.name)
        .sort((a: Genre, b: Genre) => (a.sortOrder || 0) - (b.sortOrder || 0))

      genreCache = sortedGenres
      return sortedGenres
    })
    .finally(() => {
      genreFetchPromise = null
    })

  return genreFetchPromise
}

export function GenrePopup({ isOpen, selectedGenres, onGenreToggle, onClose, onClear }: GenrePopupProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(() => genreCache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    const fetchGenres = async () => {
      if (genreCache) {
        setGenres(genreCache)
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const loadedGenres = await loadGenres()
        if (!cancelled) {
          setGenres(loadedGenres)
        }
      } catch (err) {
        console.error('ジャンル一覧の取得エラー:', err)
        if (!cancelled) {
          setError('ジャンル一覧の取得に失敗しました')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchGenres()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={handleOverlayClick}
      ></div>

      <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 max-w-sm mx-auto max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">ジャンルを選択</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B7A78]"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4">複数選択可能です</div>

          <div className="max-h-96 overflow-y-auto overscroll-y-contain mb-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <div className="text-gray-600 text-lg font-medium">読み込み中...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-sm mb-2">{error}</div>
                <Button onClick={() => window.location.reload()} variant="secondary" className="mt-4">
                  再読み込み
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="text-md font-bold text-gray-800 mb-3">ジャンル</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {genres.map((genre) => {
                    const genreId = genre.id
                    const genreName = genre.name
                    const isSelected = selectedGenres.includes(genreId)
                    const genreColors = getGenreColorByName(genreName)

                    return (
                      <button
                        key={genreId}
                        onClick={(e) => {
                          (e.currentTarget as HTMLButtonElement).blur()
                          onGenreToggle(genreId)
                        }}
                        style={isSelected ? {
                          ...getGenreBackgroundStyle(genreColors),
                          ...getGenreBorderStyle(genreColors),
                          ...getGenreHoverStyle(genreColors),
                          ...getGenreTextStyle(genreColors),
                        } : undefined}
                        className={`relative rounded-lg border-2 transition-all duration-200 active:scale-[0.98] text-center w-full text-sm py-3 px-2 min-h-[44px] flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-[#2B7A78] focus:border-[#2B7A78] ${isSelected
                          ? `${getGenreBorderClass(genreColors)} ${getGenreBackgroundClass(genreColors)} ${getGenreTextClass(genreColors)} ${getGenreHoverClass(genreColors)} shadow-md`
                          : "border-gray-300 bg-white text-gray-700"
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1">
                            <div
                              style={getGenreCheckBgStyle(genreColors)}
                              className={cn("w-4 h-4 rounded-full flex items-center justify-center", getGenreCheckBgClass(genreColors))}
                            >
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                        <span className="block">{genreName}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={onClear} variant="secondary" className="flex-1">
              クリア
            </Button>
            <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              完了（{selectedGenres.length}件選択）
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
