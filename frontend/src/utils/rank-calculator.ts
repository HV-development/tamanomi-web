import type { UserRank, RankInfo } from "../types/user"

export const RANK_THRESHOLDS = {
  bronze: 0, // 0ヶ月〜
  silver: 12, // 12ヶ月（1年）〜
  gold: 36, // 36ヶ月（3年）〜
  diamond: 60, // 60ヶ月（5年）〜
}

export const RANK_INFO: Record<UserRank, RankInfo> = {
  bronze: {
    rank: "bronze",
    label: "ブロンズ",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: null, // 画像を使用するため不要
    description: "初回ランク",
    monthsRequired: 0,
  },
  silver: {
    rank: "silver",
    label: "シルバー",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: null, // 画像を使用するため不要
    description: "契約から1年以上の優良メンバー",
    monthsRequired: 12,
  },
  gold: {
    rank: "gold",
    label: "ゴールド",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: null, // 画像を使用するため不要
    description: "契約から3年以上のロイヤルメンバー",
    monthsRequired: 36,
  },
  diamond: {
    rank: "diamond",
    label: "ダイヤモンド",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: null, // 画像を使用するため不要
    description: "5年継続利用のレジェンドメンバー",
    monthsRequired: 60,
  },
}

export function calculateUserRank(contractStartDate: Date): UserRank {
  const now = new Date()
  const monthsDiff = Math.floor(
    (now.getTime() - contractStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44), // 平均月日数
  )

  if (monthsDiff >= RANK_THRESHOLDS.diamond) return "diamond"
  if (monthsDiff >= RANK_THRESHOLDS.gold) return "gold"
  if (monthsDiff >= RANK_THRESHOLDS.silver) return "silver"
  return "bronze"
}

export function getNextRankInfo(currentRank: UserRank): RankInfo | null {
  const ranks: UserRank[] = ["bronze", "silver", "gold", "diamond"]
  const currentIndex = ranks.indexOf(currentRank)

  if (currentIndex === -1 || currentIndex === ranks.length - 1) {
    return null // 最高ランクまたは無効なランク
  }

  return RANK_INFO[ranks[currentIndex + 1]]
}

export function getMonthsToNextRank(contractStartDate: Date, currentRank: UserRank): number | null {
  const nextRank = getNextRankInfo(currentRank)
  if (!nextRank) return null

  const now = new Date()
  const monthsDiff = Math.floor((now.getTime() - contractStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

  return Math.max(0, nextRank.monthsRequired - monthsDiff)
}
