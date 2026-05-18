// ジャンル別カラー設定
import type { CSSProperties } from "react"

export interface GenreColor {
  bg: string
  text: string
  border: string
  hover: string
  checkBg: string
}

export const GENRE_COLORS: Record<string, GenreColor> = {
  izakaya: {
    bg: "#EB74041A",
    text: "#EB7404",
    border: "#EB7404",
    hover: "#EB740433",
    checkBg: "#EB7404"
  },
  // creative: {
  //   bg: "#E043A11A",
  //   text: "#E043A1",
  //   border: "#E043A1",
  //   hover: "#E043A133",
  //   checkBg: "#E043A1"
  // },
  japanese: {
    bg: "#049A2A1A",
    text: "#049A2A",
    border: "#049A2A",
    hover: "#049A2A33",
    checkBg: "#049A2A"
  },
  western: {
    bg: "#0088FF1A",
    text: "#0088FF",
    border: "#0088FF",
    hover: "#0088FF33",
    checkBg: "#0088FF"
  },
  italian: {
    bg: "#007D4F1A",
    text: "#007D4F",
    border: "#007D4F",
    hover: "#007D4F33",
    checkBg: "#007D4F"
  },
  french: {
    bg: "#A928281A",
    text: "#A92828",
    border: "#A92828",
    hover: "#A9282833",
    checkBg: "#A92828"
  },
  chinese: {
    bg: "#E6BF221A",
    text: "#E6BF22",
    border: "#E6BF22",
    hover: "#E6BF2233",
    checkBg: "#E6BF22"
  },
  yakiniku: {
    bg: "#A928281A",
    text: "#A92828",
    border: "#A92828",
    hover: "#A9282833",
    checkBg: "#A92828"
  },
  korean: {
    bg: "#CB30E01A",
    text: "#CB30E0",
    border: "#CB30E0",
    hover: "#CB30E033",
    checkBg: "#CB30E0"
  },
  ethnic: {
    bg: "#C08E0F1A",
    text: "#C08E0F",
    border: "#C08E0F",
    hover: "#C08E0F33",
    checkBg: "#C08E0F"
  },
  sushi: {
    bg: "#4D9E131A",
    text: "#4D9E13",
    border: "#4D9E13",
    hover: "#4D9E1333",
    checkBg: "#4D9E13"
  },
  curry: {
    bg: "#8F78071A",
    text: "#8F7807",
    border: "#8F7807",
    hover: "#8F780733",
    checkBg: "#8F7807"
  },
  nabe: {
    bg: "#EE2F2F1A",
    text: "#EE2F2F",
    border: "#EE2F2F",
    hover: "#EE2F2F33",
    checkBg: "#EE2F2F"
  },
  bar: {
    bg: "#6155F51A",
    text: "#6155F5",
    border: "#6155F5",
    hover: "#6155F533",
    checkBg: "#6155F5"
  },
  ramen: {
    bg: "#EB74041A",
    text: "#EB7404",
    border: "#EB7404",
    hover: "#EB740433",
    checkBg: "#EB7404"
  },
  cafe: {
    bg: "#69440C1A",
    text: "#69440C",
    border: "#69440C",
    hover: "#69440C33",
    checkBg: "#69440C"
  },
  shokudo: {
    bg: "#16A18E1A",
    text: "#16A18E",
    border: "#16A18E",
    hover: "#16A18E33",
    checkBg: "#16A18E"
  },
  udon: {
    bg: "#0088FF1A",
    text: "#0088FF",
    border: "#0088FF",
    hover: "#0088FF33",
    checkBg: "#0088FF"
  },
  other: {
    bg: "#4040401A",
    text: "#404040",
    border: "#404040",
    hover: "#40404033",
    checkBg: "#404040"
  },
  default: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    hover: "hover:bg-gray-200",
    checkBg: "bg-gray-600"
  }
}

const GENRE_NAME_TO_COLOR_KEY: Record<string, string> = {
  和食: "japanese",
  洋食: "western",
  中華: "chinese",
  イタリアン: "italian",
  韓国料理: "korean",
  フレンチ: "french",
  エスニック: "ethnic",
  寿司: "sushi",
  カレー: "curry",
  焼肉: "yakiniku",
  鍋: "nabe",
  居酒屋: "izakaya",
  ラーメン: "ramen",
  バー: "bar",
  カフェ: "cafe",
  食堂: "shokudo",
  うどん: "udon",
  その他: "other",
}

export function getGenreColor(genre: string): GenreColor {
  return GENRE_COLORS[genre] || GENRE_COLORS.default
}

export function getGenreColorByName(genreName: string): GenreColor {
  return getGenreColor(GENRE_NAME_TO_COLOR_KEY[genreName] || genreName)
}

function isTailwindTextClass(value: string): boolean {
  return value.startsWith('text-')
}

function isTailwindBgClass(value: string): boolean {
  return value.startsWith('bg-')
}

function isTailwindBorderClass(value: string): boolean {
  return value.startsWith('border-')
}

export function getGenreTextClass(color: GenreColor): string {
  return isTailwindTextClass(color.text) ? color.text : ''
}

export function getGenreTextStyle(color: GenreColor): { color: string } | undefined {
  return isTailwindTextClass(color.text) ? undefined : { color: color.text }
}

export function getGenreBackgroundClass(color: GenreColor): string {
  return isTailwindBgClass(color.bg) ? color.bg : 'bg-[var(--genre-bg)]'
}

export function getGenreBackgroundStyle(color: GenreColor): CSSProperties | undefined {
  return isTailwindBgClass(color.bg)
    ? undefined
    : ({ ['--genre-bg' as string]: color.bg } as CSSProperties)
}

export function getGenreBorderClass(color: GenreColor): string {
  return isTailwindBorderClass(color.border) ? color.border : ''
}

export function getGenreBorderStyle(color: GenreColor): { borderColor: string } | undefined {
  return isTailwindBorderClass(color.border) ? undefined : { borderColor: color.border }
}

export function getGenreCheckBgClass(color: GenreColor): string {
  return isTailwindBgClass(color.checkBg) ? color.checkBg : ''
}

export function getGenreCheckBgStyle(color: GenreColor): { backgroundColor: string } | undefined {
  return isTailwindBgClass(color.checkBg) ? undefined : { backgroundColor: color.checkBg }
}

export function getGenreHoverClass(color: GenreColor): string {
  return color.hover.startsWith('hover:') ? color.hover : 'hover:[background-color:var(--genre-hover-bg)]'
}

export function getGenreHoverStyle(color: GenreColor): CSSProperties | undefined {
  return color.hover.startsWith('hover:')
    ? undefined
    : ({ ['--genre-hover-bg' as string]: color.hover } as CSSProperties)
}

export function getGenreColorClasses(genre: string): string {
  const colors = getGenreColor(genre)
  return `${getGenreBackgroundClass(colors)} ${getGenreTextClass(colors)} ${getGenreBorderClass(colors)}`.trim()
}
