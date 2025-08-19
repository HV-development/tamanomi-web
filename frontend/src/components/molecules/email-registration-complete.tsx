"use client"

import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "../atoms/button"

interface EmailRegistrationCompleteProps {
  email: string
  onBackToLogin: () => void
  onResend: () => void
}

export function EmailRegistrationComplete({ email, onBackToLogin, onResend }: EmailRegistrationCompleteProps) {
  return (
    <div className="space-y-6">
      {/* 送信完了メッセージ */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">認証メールを送信しました</h2>
        <p className="text-gray-600 mb-4">メールアドレス認証用のリンクをお送りしました</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">送信先</p>
          <p className="text-gray-900 font-medium">{email}</p>
        </div>
      </div>

      {/* シンプルな手順説明 */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-6">
          メール内のリンクをクリックして、新規登録を完了してください
        </p>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onBackToLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          ログイン画面に戻る
        </Button>

        <Button
          onClick={onResend}
          variant="secondary"
          className="w-full py-3 text-base font-medium"
        >
          認証メールを再送信
        </Button>
      </div>
    </div>
  )
}