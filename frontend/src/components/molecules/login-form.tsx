"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { adminLoginSchema, type AdminLoginInput } from "@hv-development/schemas"
import { ZodError } from "zod"

interface LoginFormProps {
  onLogin: (data: AdminLoginInput) => void
  onSignup: () => void
  onForgotPassword: () => void
  isLoading?: boolean
  error?: string
}

export function LoginForm({ onLogin, onSignup, onForgotPassword, isLoading = false, error: externalError }: LoginFormProps) {
  const [formData, setFormData] = useState<AdminLoginInput>({
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof AdminLoginInput, string>>>({})

  const validateField = (fieldName: keyof AdminLoginInput, value: string) => {
    try {
      const fieldSchema = adminLoginSchema.shape[fieldName];
      fieldSchema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        const errorMessage = zodError.errors[0]?.message || "入力エラーです"
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
      }
    }
  }

  const validateForm = (): boolean => {
    try {
      adminLoginSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> };
        const newErrors: Partial<Record<keyof AdminLoginInput, string>> = {}
        zodError.errors.forEach((err) => {
          const fieldName = err.path?.[0] as keyof AdminLoginInput
          if (fieldName === 'email' || fieldName === 'password') {
            newErrors[fieldName] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }))
    // 常にバリデーションを実行（空の文字列でもエラーを表示）
    validateField('email', value)
  }

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }))
    // 常にバリデーションを実行（空の文字列でもエラーを表示）
    validateField('password', value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーションを実行してエラーを表示
    const isValid = validateForm()

    if (isValid) {
      onLogin(formData)
    } else {
      // バリデーションエラーがある場合は、すべてのフィールドを再検証
      validateField('email', formData.email)
      validateField('password', formData.password)
    }
  }

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSignup()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {externalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{externalError}</p>
        </div>
      )}

      <Input
        type="email"
        label="メールアドレス"
        placeholder="example@email.com"
        value={formData.email}
        onChange={handleEmailChange}
        error={errors.email}
      />

      <Input
        type="password"
        label="パスワード"
        placeholder="パスワードを入力"
        value={formData.password}
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