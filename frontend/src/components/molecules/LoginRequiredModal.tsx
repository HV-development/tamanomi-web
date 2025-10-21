"use client"



interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function LoginRequiredModal({ isOpen, onClose, onLogin }: LoginRequiredModalProps) {
  // モーダルが閉じられている場合は何も表示しない
  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]" style={{ zIndex: 9999 }}></div>

      {/* モーダル */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border-4 border-green-400 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
          {/* ヘッダー */}
          <div className="bg-green-600 p-4 text-white flex-shrink-0">
            <div className="text-center">
              <h3 className="text-xl font-bold">ログインしてください</h3>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 text-center">
                            {/* メッセージ */}
              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed">
                  クーポンの利用にはログインが必要です。<br />
                  未登録の方は新規登録をお願いします。
                </p>
              </div>
            </div>
          </div>

          {/* ボタン部分 - 固定 */}
          <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="space-y-3">
              <button
                onClick={onLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl transition-colors"
              >
                ログインする
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-4 px-4 rounded-xl transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}