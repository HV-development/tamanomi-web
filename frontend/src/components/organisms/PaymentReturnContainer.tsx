"use client"

interface PaymentReturnContainerProps {
  isProcessing: boolean
  error: string | null
  isPaymentMethodChangeOnly: boolean
}

export function PaymentReturnContainer({
  isProcessing,
  error,
  isPaymentMethodChangeOnly,
}: PaymentReturnContainerProps) {
  if (error) {
    const isUserNotFoundError = error.includes('アカウント登録が完了していない可能性があります')
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{error}</p>
            
            {isUserNotFoundError ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  アカウント登録を完了してからカード登録を行ってください。
                </p>
                <button
                  onClick={() => window.location.href = '/email-registration'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  新規登録画面へ
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                トップページに戻る
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          {isProcessing ? (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isPaymentMethodChangeOnly ? '支払い方法変更を処理中...' : 'カード登録を処理中...'}
              </h2>
              <p className="text-gray-600">
                {isPaymentMethodChangeOnly 
                  ? 'カード情報の変更を処理しています。\nしばらくお待ちください。' 
                  : 'カード情報の登録を処理しています。\nしばらくお待ちください。'
                }
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 text-green-500">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isPaymentMethodChangeOnly ? '支払い方法変更完了' : 'カード登録完了'}
              </h2>
              <p className="text-gray-600 mb-6">
                {isPaymentMethodChangeOnly 
                  ? 'カード情報の変更が完了しました。\nマイページに戻ります。' 
                  : 'カード登録が完了しました。\nマイページに戻ります。'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

