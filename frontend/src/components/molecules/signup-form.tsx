"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateInput } from "../atoms/date-input"
import { UseRregistrationCompleteSchema, type UserRegistrationComplete } from "@tamanomi/schemas"
import { z } from "zod"

interface SignupFormProps {
  initialData?: Partial<UserRegistrationComplete>
  email?: string
  onSubmit: (data: UserRegistrationComplete) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SignupForm({ initialData, email, onSubmit, onCancel, isLoading = false }: SignupFormProps) {
  const [formData, setFormData] = useState<UserRegistrationComplete>({
    nickname: "",
    password: "",
    passwordConfirm: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistrationComplete, string>>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  // initialDataが変更された際にフォームデータを更新
  useEffect(() => {
    if (initialData) {
      setFormData({
        nickname: initialData.nickname || "",
        password: initialData.password || "",
        passwordConfirm: initialData.passwordConfirm || "",
        postalCode: initialData.postalCode || "",
        address: initialData.address || "",
        birthDate: initialData.birthDate || "",
        gender: initialData.gender || "male",
      })
    }
  }, [initialData])

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const validateForm = () => {
    try {
      // スキーマを使用してバリデーション
      const result = UseRregistrationCompleteSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as any).errors)) {
        const zodError = error as any
        const newErrors: Partial<Record<keyof UserRegistrationComplete, string>> = {}

        zodError.errors.forEach((err: any) => {
          const field = err.path?.[0] as keyof UserRegistrationComplete
          if (field) {
            newErrors[field] = err.message
          }
        })

        setErrors(() => newErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = validateForm()
    if (isValid) {
      onSubmit(formData)
    }
  }

  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, "")
    setIsSearchingAddress(true)

    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`

    try {
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.success && data.address) {
        setFormData(prev => ({
          ...prev,
          address: data.address
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          address: data.message || "該当する住所が見つかりませんでした。手入力で住所を入力してください。"
        }))

        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        address: "住所検索サービスに接続できませんでした。ネットワーク接続を確認するか、手入力で住所を入力してください。"
      }))

      setTimeout(() => {
        if (addressInputRef.current) {
          addressInputRef.current.focus()
        }
      }, 100)
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const updateFormData = (field: keyof UserRegistrationComplete, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 入力時のヘルパー
  const handleInputChange = (field: keyof UserRegistrationComplete, value: string) => {
    updateFormData(field, value)
  }

  // エラー状態の変更を監視
  useEffect(() => {
    // エラー状態の変更を監視（必要に応じて）
  }, [errors])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* メールアドレス表示 */}
      {email && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {email}
          </div>
          <p className="mt-1 text-xs text-gray-500">※認証済みのメールアドレスです</p>
        </div>
      )}

      {/* ニックネーム */}
      <Input
        type="text"
        label="ニックネーム"
        placeholder="ニックネームを入力"
        value={formData.nickname}
        onChange={(value) => handleInputChange("nickname", value)}
        error={errors.nickname}
      />

      {/* 郵便番号と住所検索ボタンを横並び */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          郵便番号
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="123-4567 または 1234567"
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearchingAddress}
            variant="secondary"
            className="px-6 py-3 whitespace-nowrap"
          >
            {isSearchingAddress ? "検索中..." : "住所検索"}
          </Button>
        </div>
        {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
      </div>

      {/* 住所入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          住所
        </label>
        <input
          ref={addressInputRef}
          type="text"
          placeholder="住所を入力するか、上記の住所検索ボタンをご利用ください"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* 生年月日 */}
      <DateInput
        label="生年月日"
        value={formData.birthDate}
        onChange={(value) => handleInputChange("birthDate", value)}
        error={errors.birthDate}
      />

      {/* 性別 */}
      <RadioButton
        name="gender"
        label="性別"
        options={genderOptions}
        value={formData.gender}
        onChange={(value) => handleInputChange("gender", value)}
        error={errors.gender}
      />


      {/* パスワード */}
      <Input
        type="password"
        label="パスワード"
        placeholder="8文字以上の英数字"
        value={formData.password}
        onChange={(value) => handleInputChange("password", value)}
        error={errors.password}
      />

      {/* パスワード確認 */}
      <Input
        type="password"
        label="パスワード確認"
        placeholder="パスワードを再入力"
        value={formData.passwordConfirm}
        onChange={(value) => handleInputChange("passwordConfirm", value)}
        error={errors.passwordConfirm}
      />



      {/* ボタン */}
      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "確認中..." : "登録内容を確認する"}
        </Button>

        <Button type="button" onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>
    </form>
  )
}