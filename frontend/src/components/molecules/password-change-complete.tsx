"use client"

import { CheckCircle, Lock, LogIn } from "lucide-react"
import { Button } from "../atoms/button"

interface PasswordChangeCompleteProps {
  onBackToLogin: () => void
}

export function PasswordChangeComplete({ onBackToLogin }: PasswordChangeCompleteProps) {
  return (
    <div className="space-y-6">
      {/* 完了メッセージ */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">パスワード変更完了</h2>
          <p className="text-gray-600">パスワードが正常に変更されました</p>
        </div>
      </div>

      {/* 成功メッセージ */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <div className="font-bold mb-2">変更完了</div>
            <div>新しいパスワードが正常に設定されました。次回ログイン時から新しいパスワードをご利用ください。</div>
          </div>
        </div>
      </div>

      {/* 重要な注意 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-bold mb-2">セキュリティについて</div>
            <ul className="space-y-1">
              <li>• 他のデバイスでログインしている場合は、再ログインが必要です</li>
              <li>• 新しいパスワードは安全な場所に保管してください</li>
              <li>• 定期的なパスワード変更をお勧めします</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onBackToLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          ログイン画面に移動
        </Button>
      </div>
    </div>
  )
}