"use client"

interface WithdrawalCompleteProps {
  onBackToTop: () => void
  withdrawalScheduledDate?: string | null
}

export function WithdrawalComplete({ onBackToTop, withdrawalScheduledDate }: WithdrawalCompleteProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <div className="space-y-8">
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          退会手続き完了
        </h2>
        
        <div className="text-gray-700 leading-relaxed space-y-2">
          <p>退会手続きが完了しました。</p>
          {withdrawalScheduledDate ? (
            <>
              <p className="font-bold text-gray-900">
                {formatDate(withdrawalScheduledDate)} までサービスをご利用いただけます。
              </p>
              <p className="text-sm text-gray-500 mt-2">
                上記の日付を過ぎるとアカウントが無効になります。
              </p>
            </>
          ) : (
            <p>ご利用ありがとうございました。</p>
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-center">
        <button
          onClick={onBackToTop}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base transition-colors"
        >
          {withdrawalScheduledDate ? "マイページに戻る" : "トップ画面に戻る"}
        </button>
      </div>
    </div>
  )
}