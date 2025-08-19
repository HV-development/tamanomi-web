"use client"

import { Mail, CheckCircle, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
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
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">認証メールを送信しました</h2>
          <p className="text-gray-600">メールアドレス認証用のリンクをお送りしました</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-800 font-medium mb-2">送信先メールアドレス</p>
          <p className="text-green-900 font-bold">{email}</p>
        </div>
      </div>

      {/* 手順説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          次の手順で新規登録を完了してください
        </h3>
        <ol className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              1
            </span>
            <span>送信されたメールを開いてください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              2
            </span>
            <span>メール内の「新規登録を続ける」リンクをクリックしてください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              3
            </span>
            <span>新規登録画面で必要事項を入力して登録を完了してください</span>
          </li>
        </ol>
      </div>



      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onBackToLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ログイン画面に戻る
        </Button>

        <Button
          onClick={onResend}
          variant="secondary"
          className="w-full py-3 text-base font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          認証メールを再送信
        </Button>
      </div>
    </div>
  )
}