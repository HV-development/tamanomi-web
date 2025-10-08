"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { z } from "zod"

// ログインフォーム用のバリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
})

interface LoginFormProps {
  onLogin: (email: string, password: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  isLoading?: boolean
  error?: string
}

export function LoginForm({ onLogin, onSignup, onForgotPassword, isLoading = false, error: externalError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  // Zodスキーマを使った統一バリデーション関数
  const validateField = (fieldName: string, value: string) => {
    try {
      loginSchema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value })

      // エラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName as keyof typeof newErrors]
        return newErrors
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "入力エラーです"
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
      }
    }
  }

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {}
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string
          if (fieldName === 'email' || fieldName === 'password') {
            newErrors[fieldName] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // リアルタイムバリデーション（input時）
  const handleEmailChange = (value: string) => {
    setEmail(value)
    // 空文字の場合はバリデーションをスキップ（必須チェックは送信時のみ）
    if (value.trim()) {
      validateField('email', value)
    } else {
      // エラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    // 空文字の場合はバリデーションをスキップ（必須チェックは送信時のみ）
    if (value.trim()) {
      validateField('password', value)
    } else {
      // エラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onLogin(email, password)
    }
  }

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault() // フォーム送信を防ぐ
    onSignup()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 外部エラー表示 */}
      {externalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{externalError}</p>
        </div>
      )}

      <Input
        type="email"
        label="メールアドレス"
        placeholder="example@email.com"
        value={email}
        onChange={handleEmailChange}
        error={errors.email}
      />

      <Input
        type="password"
        label="パスワード"
        placeholder="パスワードを入力"
        value={password}
        onChange={handlePasswordChange}
        error={errors.password}
      />

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "ログイン中..." : "ログイン"}
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