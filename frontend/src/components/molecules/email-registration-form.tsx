"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"

interface EmailRegistrationFormProps {
  initialEmail?: string
  onSubmit: (email: string) => void
  onBack: () => void
  isLoading?: boolean
}

export function EmailRegistrationForm({ initialEmail = "", onSubmit, onBack, isLoading = false }: EmailRegistrationFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState("")

  // initialEmailが変更された時にemailを更新
  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

  const validateEmail = (email: string) => {
    // メールアドレス - 必須チェック
    if (!email) {
      return "メールアドレスを入力してください。"
    }
    // メールアドレス - メールフォーマットチェック
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "正しいメールアドレスを入力してください。"
    }
    return ""
  }

  // リアルタイムバリデーション（input時）
  const handleEmailChange = (value: string) => {
    setEmail(value)
    // エラーをクリア（リアルタイムでエラー表示しない）
    if (error) {
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">メールアドレス認証</h3>
        <div className="text-gray-600 space-y-2">
          <p>新規登録にはメールアドレスの認証が必要です。</p>
          <p>入力されたメールアドレスに認証用のリンクをお送りします。</p>
        </div>
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
          {isLoading ? "送信中..." : "認証メールを送信"}
        </Button>

        <Button type="button" onClick={onBack} variant="secondary" className="w-full py-3 text-base font-medium">
          戻る
        </Button>
      </div>
    </form>
  )
}
