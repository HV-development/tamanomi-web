"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"

interface LoginFormProps {
  onLogin: (email: string, otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  isLoading?: boolean
}

export function LoginForm({ onLogin, onSignup, onForgotPassword, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string } = {}

    // メールアドレス - 必須チェック
    if (!email) {
      newErrors.email = "メールアドレスを入力してください。"
    // メールアドレス - メールフォーマットチェック
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "正しいメールアドレスを入力してください。"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // リアルタイムバリデーション（input時）
  const validateField = (field: 'email', value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'email') {
      // メールアドレス - 必須チェック
      if (!value) {
        newErrors.email = "メールアドレスを入力してください。"
      // メールアドレス - メールフォーマットチェック
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "正しいメールアドレスを入力してください。"
      } else {
        delete newErrors.email
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // ワンタイムパスワードを送信（otpは空文字で送信）
      onLogin(email, "")
    }
  }

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault() // フォーム送信を防ぐ
    onSignup()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        label="メールアドレス"
        placeholder="example@email.com"
        value={email}
        onChange={(value) => {
          setEmail(value)
          validateField('email', value)
        }}
        error={errors.email}
      />

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "送信中..." : "ワンタイムパスワードを送信"}
        </Button>

        <Button type="button" onClick={handleSignupClick} variant="secondary" className="w-full py-3 text-base font-medium">
          新規登録
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onForgotPassword()
          }}
          className="text-sm text-green-600 hover:text-green-700 underline"
        >
          パスワードを忘れた方
        </button>
      </div>
    </form>
  )
}