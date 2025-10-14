"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "../atoms/button"
import { otpVerifySchema } from '@/schemas/auth'
import { z } from "zod"

interface OtpInputFormProps {
  email: string
  onVerifyOtp: (otp: string) => void
  onResendOtp: () => void
  onBack: () => void
  isLoading?: boolean
  error?: string // 外部エラーを追加
  requestId?: string // OTP検証に必要なrequestIdを追加
}

export function OtpInputForm({
  email,
  onVerifyOtp,
  onResendOtp,
  onBack,
  error: externalError,
}: OtpInputFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  
  // 外部エラーが変更されたら内部エラーを更新
  useEffect(() => {
    if (externalError) {
      setError(externalError)
    }
  }, [externalError])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 入力フィールドの参照を初期化
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // 最初の入力フィールドにフォーカス
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Zodスキーマを使ったバリデーション
  const validateOtp = (otpArray: string[]) => {
    const otpString = otpArray.join("")
    try {
      // otpVerifySchemaのotpフィールドのみをバリデーション
      otpVerifySchema.pick({ otp: true }).parse({ otp: otpString })
      return ""
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "OTPの入力エラーです"
      }
      return "OTPの入力エラーです"
    }
  }

  const handleInputChange = (index: number, value: string) => {
    // 数字のみ許可
    const numericValue = value.replace(/\D/g, "")

    if (numericValue.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = numericValue
      setOtp(newOtp)

      // エラーをクリア
      if (error) {
        setError("")
      }

      // 次のフィールドにフォーカス
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // バックスペースで前のフィールドに移動
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // 左右矢印キーでの移動
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Enterキーで送信
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit(otp)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)

      // 最後のフィールドにフォーカス
      inputRefs.current[5]?.focus()

      // エラーをクリア
      if (error) {
        setError("")
      }
    }
  }

  const handleSubmit = (otpArray: string[] = otp) => {
    const otpError = validateOtp(otpArray)
    if (otpError) {
      setError(otpError)
      return
    }
    setError("")
    onVerifyOtp(otpArray.join(""))
  }

  const handleClear = () => {
    setOtp(["", "", "", "", "", ""])
    setError("")
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">ワンタイムパスワード入力</h3>
        <div className="text-gray-600 space-y-2">
          <p>以下のメールアドレスに6桁のワンタイムパスワードを送信しました。</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-mono text-green-800 font-medium">{email}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
          ワンタイムパスワード（6桁）
        </label>

        {/* OTP入力ボックス */}
        <div className="flex justify-center gap-1 sm:gap-3 mb-4 px-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 rounded-lg transition-all duration-200 ${digit
                  ? "border-green-500 bg-green-50 text-green-900"
                  : "border-gray-300 bg-white text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
              maxLength={1}
              autoComplete="off"
            />
          ))}
        </div>

        {/* エラーメッセージ */}
        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {/* クリアボタン */}
        <div className="text-center mb-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <div className="font-bold mb-2">ワンタイムパスワードについて</div>
          <ul className="space-y-1">
            <li>• 有効期限は10分間です</li>
            <li>• メールが届かない場合は迷惑メールフォルダをご確認ください</li>
            <li>• 6桁すべて入力すると自動で認証されます</li>
            <li>• コピー&ペーストにも対応しています</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onResendOtp}
          variant="secondary"
          className="w-full py-3 text-base font-medium"
        >
          ワンタイムパスワードを再送信
        </Button>

        <Button
          onClick={onBack}
          variant="secondary"
          className="w-full py-3 text-base font-medium"
        >
          メールアドレス入力に戻る
        </Button>
      </div>
    </div>
  )
}