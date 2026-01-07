"use client"

interface EmailConfirmationCompleteProps {
  className?: string
}

export function EmailConfirmationComplete({ 
  className = "" 
}: EmailConfirmationCompleteProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          確認メール送信完了
        </h2>
        
        <div className="text-gray-700 leading-relaxed space-y-2">
          <p>ご登録いただいたメールアドレスに</p>
          <p>メールを送信しました。</p>
          <p>メール内のリンクをクリックして、登</p>
          <p>録を完了してください。</p>
        </div>
      </div>

      {/* ログイン画面に戻るボタン */}
      <div className="flex justify-center">
        <button
          onClick={() => window.location.href = '/'}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base transition-colors"
        >
          ログイン画面に戻る
        </button>
      </div>
    </div>
  )
}