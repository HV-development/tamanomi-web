"use client"

import { Clock, ArrowLeft, Home } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { UsageHistory } from "../../types/user"

interface UsageHistoryListProps {
  history: UsageHistory[]
  onBackToMyPage: () => void
  onBackToTop: () => void
  className?: string
  currentUserRank?: string | null
}

export function UsageHistoryList({ 
  history, 
  onBackToMyPage, 
  onBackToTop, 
  className = "",
  currentUserRank
}: UsageHistoryListProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  const formatDate = (date: Date) => {
    return format(date, "yyyy年M月d日 HH:mm", { locale: ja })
  }

  const formatUsageId = (usageId: string) => {
    return usageId.toUpperCase()
  }

  if (history.length === 0) {
    return (
      <div className={`min-h-screen ${backgroundColorClass} ${className}`}>
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBackToMyPage} 
              className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
            >
              ← 戻る
            </button>
            <img 
              src="/logo.svg"
              alt="TAMAYOI" 
              className="h-8 object-contain"
            />
            <div className="w-12"></div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">クーポン利用履歴</h1>
          
          {/* 空の状態 */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-green-700 text-lg font-medium mb-2">まだ利用履歴がありません</div>
            <div className="text-green-600 text-sm">クーポンを利用すると履歴がここに表示されます</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${backgroundColorClass} ${className}`}>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBackToMyPage} 
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            ← 戻る
          </button>
          <img 
            src="/logo.svg"
            alt="TAMAYOI" 
            className="h-8 object-contain"
          />
          <div className="w-12"></div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">クーポン利用履歴</h1>

        {/* 履歴リスト */}
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border-2 border-green-300 p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 利用履歴ID */}
              <div className="mb-4">
                <div className="text-green-600 font-medium mb-2">利用履歴ID</div>
                <div className="font-bold text-xl text-gray-900">
                  {formatUsageId(item.usageId)}
                </div>
              </div>

              {/* 店舗名 */}
              <div className="mb-4">
                <div className="text-green-600 font-medium mb-2">店舗名</div>
                <div className="font-bold text-lg text-gray-900">{item.storeName}</div>
              </div>

              {/* クーポン名 */}
              <div className="mb-4">
                <div className="text-green-600 font-medium mb-2">クーポン名</div>
                <div className="text-gray-900">{item.couponName}</div>
              </div>

              {/* 利用日時 */}
              <div>
                <div className="text-green-600 font-medium mb-2">利用日時</div>
                <div className="text-gray-900">{formatDate(item.usedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 下部ボタン */}
      <div className="p-6 border-t border-green-200">
        <div className="space-y-3 max-w-md mx-auto">
          <button
            onClick={onBackToMyPage}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            マイページに戻る
          </button>
          <button
            onClick={onBackToTop}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-300"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    </div>
  )
}