// ジャンル別カラー設定
export interface GenreColor {
  bg: string
  text: string
  border: string
  hover: string
}

export const GENRE_COLORS: Record<string, GenreColor> = {
  izakaya: {
    bg: "bg-orange-200",
    text: "text-orange-800",
    border: "border-orange-300",
    hover: "hover:bg-orange-300"
  },
  creative: {
    bg: "bg-pink-200",
    text: "text-pink-800",
    border: "border-pink-300",
    hover: "hover:bg-pink-300"
  },
  japanese: {
    bg: "bg-green-200",
    text: "text-green-800",
    border: "border-green-300",
    hover: "hover:bg-green-300"
  },
  western: {
    bg: "bg-cyan-200",
    text: "text-cyan-800",
    border: "border-cyan-300",
    hover: "hover:bg-cyan-300"
  },
  italian: {
    bg: "bg-lime-200",
    text: "text-lime-800",
    border: "border-lime-300",
    hover: "hover:bg-lime-300"
  },
  french: {
    bg: "bg-rose-200",
    text: "text-rose-800",
    border: "border-rose-300",
    hover: "hover:bg-rose-300"
  },
  chinese: {
    bg: "bg-yellow-200",
    text: "text-yellow-800",
    border: "border-yellow-300",
    hover: "hover:bg-yellow-300"
  },
  yakiniku: {
    bg: "bg-red-200",
    text: "text-red-800",
    border: "border-red-300",
    hover: "hover:bg-red-300"
  },
  korean: {
    bg: "bg-purple-200",
    text: "text-purple-800",
    border: "border-purple-300",
    hover: "hover:bg-purple-300"
  },
  asian: {
    bg: "bg-amber-200",
    text: "text-amber-800",
    border: "border-amber-300",
    hover: "hover:bg-amber-300"
  },
  bar: {
    bg: "bg-indigo-200",
    text: "text-indigo-800",
    border: "border-indigo-300",
    hover: "hover:bg-indigo-300"
  },
  ramen: {
    bg: "bg-orange-300",
    text: "text-orange-900",
    border: "border-orange-400",
    hover: "hover:bg-orange-400"
  },
  soba: {
    bg: "bg-gray-200",
    text: "text-gray-800",
    border: "border-gray-300",
    hover: "hover:bg-gray-300"
  },
  udon: {
    bg: "bg-teal-200",
    text: "text-teal-800",
    border: "border-teal-300",
    hover: "hover:bg-teal-300"
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