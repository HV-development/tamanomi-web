"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateInput } from "../atoms/date-input"
import { UseRregistrationCompleteSchema, type UserRegistrationComplete } from "@hv-development/schemas"
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
    saitamaAppId: "",
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
        saitamaAppId: initialData.saitamaAppId || "",
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
              placeholder="1234567"
              value={formData.postalCode}
              onChange={(e) => {
                // 数字のみを許可、7桁まで
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 7)
                handleInputChange("postalCode", value)
              }}
              maxLength={7}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearchingAddress || formData.postalCode.length !== 7}
            variant="secondary"
            className="px-6 py-3 whitespace-nowrap"
          >
            {isSearchingAddress ? "検索中..." : "住所検索"}
          </Button>
        </div>
        {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
        <p className="mt-1 text-xs text-gray-500">※ハイフンなしで7桁の数字を入力してください</p>
      </div>

      {/* 住所表示 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          住所
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[48px]">
          {formData.address || '郵便番号を入力すると表示されます'}
        </div>
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* 生年月日（ドロップダウン形式） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          生年月日
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* 年 */}
          <select
            value={formData.birthDate ? formData.birthDate.split('-')[0] : ''}
            onChange={(e) => {
              const year = e.target.value
              const month = formData.birthDate?.split('-')[1] || '01'
              const day = formData.birthDate?.split('-')[2] || '01'
              handleInputChange("birthDate", year ? `${year}-${month}-${day}` : '')
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <option value="">年</option>
            {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>

          {/* 月 */}
          <select
            value={formData.birthDate ? formData.birthDate.split('-')[1] : ''}
            onChange={(e) => {
              const year = formData.birthDate?.split('-')[0] || new Date().getFullYear().toString()
              const month = e.target.value
              const day = formData.birthDate?.split('-')[2] || '01'
              handleInputChange("birthDate", month ? `${year}-${month}-${day}` : '')
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <option value="">月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month.toString().padStart(2, '0')}>{month}月</option>
            ))}
          </select>

          {/* 日 */}
          <select
            value={formData.birthDate ? formData.birthDate.split('-')[2] : ''}
            onChange={(e) => {
              const year = formData.birthDate?.split('-')[0] || new Date().getFullYear().toString()
              const month = formData.birthDate?.split('-')[1] || '01'
              const day = e.target.value
              handleInputChange("birthDate", day ? `${year}-${month}-${day}` : '')
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <option value="">日</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day.toString().padStart(2, '0')}>{day}日</option>
            ))}
          </select>
        </div>
        {errors.birthDate && <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>}
      </div>

      {/* 性別 */}
      <RadioButton
        name="gender"
        label="性別"
        options={genderOptions}
        value={formData.gender}
        onChange={(value) => handleInputChange("gender", value)}
        error={errors.gender}
      />

      {/* さいたま市みんなのアプリID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          さいたま市みんなのアプリID（任意）
        </label>
        <input
          type="text"
          placeholder="例: user_12345"
          value={formData.saitamaAppId || ''}
          onChange={(e) => {
            // 半角英数字とアンダースコアのみを許可
            const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
            handleInputChange("saitamaAppId", value)
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        />
        {errors.saitamaAppId && <p className="mt-1 text-sm text-red-500">{errors.saitamaAppId}</p>}
        <p className="mt-1 text-xs text-gray-500">※半角英数字とアンダースコア(_)のみ使用できます</p>
      </div>

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