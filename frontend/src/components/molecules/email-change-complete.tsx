"use client"

import { Button } from "../atoms/button"

interface EmailChangeCompleteProps {
  currentEmail: string
  newEmail: string
  onBackToMyPage: () => void
  onResend: () => void
}

export function EmailChangeComplete({ currentEmail, newEmail, onBackToMyPage, onResend = () => {} }: EmailChangeCompleteProps) {
  return (
    <div className="space-y-6">
      {/* メインメッセージカード */}
      <div className="bg-white rounded-2xl border-2 border-green-300 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          確認メール送信完了
        </h2>
        
        <div className="text-gray-700 leading-relaxed space-y-2">
          <p>ご登録いただいたメールアドレスにメールを送信しました。メール内のリンクをクリックして、登録を完了してください。</p>
        </div>
      </div>

      {/* ログイン画面に戻るボタン */}
      <div className="flex justify-center">
        <Button
          onClick={onBackToMyPage}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base"
        >
          ログイン画面に戻る
        </Button>
      </div>
    </div>
  )
}