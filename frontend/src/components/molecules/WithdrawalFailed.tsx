"use client"

interface WithdrawalFailedProps {
  onRetry: () => void
  onBackToTop: () => void
}

export function WithdrawalFailed({ onRetry, onBackToTop }: WithdrawalFailedProps) {
  return (
    <div className="space-y-8">
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-red-300 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          退会処理に失敗しました
        </h2>

        <div className="text-gray-700 leading-relaxed space-y-2">
          <p>決済サービスとの通信中にエラーが発生しました。</p>
          <p>お手数ですが、再度お試しください。</p>
          <p className="text-sm text-gray-500 mt-4">
            問題が続く場合はサポートまでお問い合わせください。
          </p>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={onRetry}
          className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium text-base transition-colors"
        >
          再度退会を試みる
        </button>
        <button
          onClick={onBackToTop}
          className="w-full max-w-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-3 rounded-full font-medium text-base transition-colors"
        >
          マイページに戻る
        </button>
      </div>
    </div>
  )
}
