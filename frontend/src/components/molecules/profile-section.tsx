"use client"

import { User, Edit } from "lucide-react"
import { RankBadge } from "../atoms/rank-badge"
import { getNextRankInfo, getMonthsToNextRank, RANK_INFO } from "../../utils/rank-calculator"
import type { User as UserType } from "../../types/user"

interface ProfileSectionProps {
  user: UserType
  onEdit: () => void
  className?: string
  currentUserRank?: string | null
}

export function ProfileSection({ user, onEdit, className = "", currentUserRank }: ProfileSectionProps) {
  // ランク計算
  const contractStartDate = user.contractStartDate || user.createdAt
  const nextRank = currentUserRank ? getNextRankInfo(currentUserRank) : null
  const monthsToNext = currentUserRank ? getMonthsToNextRank(contractStartDate, currentUserRank) : null
  const currentRankInfo = currentUserRank ? RANK_INFO[currentUserRank] : null

  // ランクが計算されていない場合は基本情報のみ表示
  if (!currentUserRank || !currentRankInfo) {
    return (
      <div className={`bg-white rounded-2xl border border-green-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">プロフィール</h2>
              <p className="text-sm text-gray-600">基本情報とランク</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="プロフィールを編集"
          >
            <Edit className="w-5 h-5 text-gray-600 hover:text-green-600" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl p-5 border border-green-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">ニックネーム</span>
              <span className="text-sm font-bold text-gray-900">{user.nickname}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">メールアドレス</span>
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
          </div>
          <div className="border-t border-white/50 pt-4 mt-4">
            <div className="text-center text-gray-500">ランク情報を読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-green-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">プロフィール</h2>
            <p className="text-sm text-gray-600">基本情報とランク</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="プロフィールを編集"
        >
          <Settings className="w-5 h-5 text-gray-600 hover:text-green-600" />
        </button>
      </div>

      {/* 統合されたプロフィール情報 */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl p-5 border border-green-200">
        {/* 基本情報 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">ニックネーム</span>
            <span className="text-sm font-bold text-gray-900">{user.nickname}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">メールアドレス</span>
            <span className="text-sm text-gray-900">{user.email}</span>
          </div>
        </div>

        {/* ランク表示 - メールアドレスの下に移動 */}
        <div className="border-t border-white/50 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">メンバーランク</span>
            <RankBadge rank={currentUserRank} size="md" />
          </div>

          {/* ランク説明 */}
          <div className="text-xs text-gray-600 bg-white/60 rounded-lg p-3 mb-4">{currentRankInfo.description}</div>

          {/* 次のランク情報 */}
          {nextRank && monthsToNext !== null && (
            <div className="mb-4 p-3 bg-white/70 rounded-lg border border-purple-100">
              <div className="text-center mb-2">
                <div className="text-xs text-gray-600 mb-2">あと{monthsToNext}ヶ月で</div>
                <div className="flex items-center justify-center gap-2">
                  <RankBadge rank={nextRank.rank} size="lg" showLabel={false} />
                  <span className="text-xs text-purple-700 font-medium">{nextRank.label}にランクアップ！</span>
                </div>
              </div>
            </div>
          )}

          {/* 最高ランク達成時 */}
          {currentUserRank === "diamond" && (
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-medium text-center">
                🎉 最高ランク達成！レジェンドメンバーです
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}