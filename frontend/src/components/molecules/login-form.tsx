"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { otpRequestSchema } from '@/schemas/auth'
import { z } from "zod"

interface LoginFormProps {
  onLogin: (email: string, otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  isLoading?: boolean
}

export function LoginForm({ onLogin, onSignup, onForgotPassword, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string }>({})

  // Zodスキーマを使った統一バリデーション関数
  const validateField = (fieldName: string, value: string) => {
    try {
      otpRequestSchema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value })

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
      otpRequestSchema.parse({ email })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string } = {}
        error.errors.forEach(err => {
          const fieldName = err.path[0] as string
          if (fieldName === 'email') {
            newErrors.email = err.message
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
        onChange={handleEmailChange}
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