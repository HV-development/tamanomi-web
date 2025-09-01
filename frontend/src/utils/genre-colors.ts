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
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-200"
  },
  western: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    hover: "hover:bg-sky-200"
  },
  italian: {
    bg: "bg-lime-100",
    text: "text-lime-700",
    border: "border-lime-200",
    hover: "hover:bg-lime-200"
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
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    hover: "hover:bg-fuchsia-200"
  },
  asian: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    hover: "hover:bg-amber-200"
  },
  bar: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    hover: "hover:bg-violet-200"
  },
  ramen: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    hover: "hover:bg-teal-200"
  },
  soba: {
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
    hover: "hover:bg-stone-200"
  },
  udon: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
    hover: "hover:bg-cyan-200"
  },
  default: {
    bg: "bg-neutral-100",
    text: "text-neutral-700",
    border: "border-neutral-200",
    hover: "hover:bg-neutral-200"
  }
}

export function getGenreColor(genre: string): GenreColor {
  return GENRE_COLORS[genre] || GENRE_COLORS.default
}

export function getGenreColorClasses(genre: string): string {
  const colors = getGenreColor(genre)
  return `${colors.bg} ${colors.text} ${colors.border}`
}