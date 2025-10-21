"use client"

interface WithdrawalCompleteProps {
  onBackToTop: () => void
}

export function WithdrawalComplete({ onBackToTop }: WithdrawalCompleteProps) {
  return (
    <div className="space-y-8">
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          退会完了
        </h2>
        
        <div className="text-gray-700 leading-relaxed space-y-2">
          <p>ご利用ありがとうございました。</p>
          <p>またのご利用をお待ちしております。</p>
        </div>
      </div>

      {/* トップ画面に戻るボタン */}
      <div className="flex justify-center">
        <button
          onClick={onBackToTop}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base transition-colors"
        >
          トップ画面に戻る
        </button>
      </div>
    </div>
  )
}