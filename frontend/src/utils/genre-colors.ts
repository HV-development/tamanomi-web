// ジャンル別カラー設定
export interface GenreColor {
  bg: string
  text: string
  border: string
  hover: string
}

export const GENRE_COLORS: Record<string, GenreColor> = {
  izakaya: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    hover: "hover:bg-orange-200"
  },
  creative: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    hover: "hover:bg-purple-200"
  },
  japanese: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    hover: "hover:bg-red-200"
  },
  western: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    hover: "hover:bg-blue-200"
  },
  italian: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    hover: "hover:bg-green-200"
  },
  french: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
    hover: "hover:bg-pink-200"
  },
  chinese: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-200"
  },
  yakiniku: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    hover: "hover:bg-red-200"
  },
  korean: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    hover: "hover:bg-rose-200"
  },
  asian: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    hover: "hover:bg-amber-200"
  },
  bar: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-200"
  },
  ramen: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    hover: "hover:bg-orange-200"
  },
  soba: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  },
  udon: {
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
    hover: "hover:bg-stone-200"
  },
  default: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  }
}

export function getGenreColor(genre: string): GenreColor {
  return GENRE_COLORS[genre] || GENRE_COLORS.default
}

export function getGenreColorClasses(genre: string): string {
  const colors = getGenreColor(genre)
  return `${colors.bg} ${colors.text} ${colors.border}`
}