"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../atoms/button"

interface PasswordResetFormProps {
  onSubmit: (email: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PasswordResetForm({ onSubmit, onCancel, isLoading = false }: PasswordResetFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    // メールアドレス - 必須チェック
    if (!email) {
      return "有効なメールアドレスを入力してください。"
    }
    // メールアドレス - メールフォーマットチェック
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "正しい有効なメールアドレスを入力してください。"
    }
    return ""
  }

  // リアルタイムバリデーション（input時）
  const handleEmailChange = (value: string) => {
    setEmail(value)
    // リアルタイムバリデーション
    if (value) {
      const emailError = validateEmail(value)
      setError(emailError)
    } else {
      // 空の場合はエラーをクリア（入力中は必須エラーを表示しない）
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setError("")
    onSubmit(email)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 leading-relaxed">
          ご登録いただいている有効なメールアドレスを入力してください。
          <br />
          パスワード再設定用のリンクをお送りします。
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "送信中..." : "送信する"}
        </Button>

        <Button type="button" onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>
    </form>
  )
}
