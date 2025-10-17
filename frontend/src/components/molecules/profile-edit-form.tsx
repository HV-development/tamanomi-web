"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateSelect } from "../atoms/date-select"
import type { User } from "../../types/user"
import {
  profileEditSchema,
  type ProfileEditInput,
  validateNicknameRealtime,
  validatePostalCodeRealtime,
  validateBirthDateRealtime,
  type ProfileValidationResult
} from "@hv-development/schemas"
import { z } from "zod"

interface ProfileEditFormProps {
  user: User
  onSubmit: (data: ProfileEditInput, updatedFields: string[]) => void
  onCancel: () => void
  onWithdraw?: () => void
  isLoading?: boolean
}

export function ProfileEditForm({ user, onSubmit, onCancel, isLoading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileEditInput>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
    saitamaAppId: "",
    registeredStore: "",
  })

  const [originalData, setOriginalData] = useState<ProfileEditInput>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
    saitamaAppId: "",
    registeredStore: "",
  })

  const [errors, setErrors] = useState<Partial<ProfileEditInput>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  // ユーザーデータでフォームを初期化
  useEffect(() => {
    // 生年月日の形式をISO形式からyyyy/MM/dd形式に変換
    const formatBirthDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return ""
      // ISO形式 (1990-05-15) を yyyy/MM/dd形式 (1990/05/15) に変換
      return dateStr.replace(/-/g, "/")
    }

    const initialData = {
      nickname: user.nickname || "",
      postalCode: user.postalCode || "",
      address: user.address || "",
      birthDate: formatBirthDate(user.birthDate),
      gender: (user.gender as "male" | "female" | "other") || "male",
      saitamaAppId: (user as User & { saitamaAppId?: string }).saitamaAppId || "",
      registeredStore: user.registeredStore || "",
    }
    setFormData(initialData as any)
    setOriginalData(initialData as any)
  }, [user])

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const fieldLabels: Record<keyof ProfileEditInput, string> = {
    nickname: "ニックネーム",
    postalCode: "郵便番号",
    address: "住所",
    birthDate: "生年月日",
    gender: "性別",
    saitamaAppId: "さいたま市みんなのアプリID",
    registeredStore: "登録店舗",
  }

  const getUpdatedFields = () => {
    const updatedFields: string[] = []

    Object.keys(formData).forEach((key) => {
      const fieldKey = key as keyof ProfileEditInput
      if (formData[fieldKey] !== originalData[fieldKey]) {
        updatedFields.push(fieldLabels[fieldKey])
      }
    })

    return updatedFields
  }

  const validateForm = () => {
    try {
      // tamanomi-schemasのスキーマを使用してバリデーション
      profileEditSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> };
        const newErrors: Partial<ProfileEditInput> = {}
        zodError.errors.forEach((err) => {
          const field = err.path?.[0] as keyof ProfileEditInput
          if (field) {
            newErrors[field] = err.message as any
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const updatedFields = getUpdatedFields()
      onSubmit(formData, updatedFields)
    }
  }

  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, "")

    // tamanomi-schemasのバリデーション関数を使用
    const postalCodeValidation = validatePostalCodeRealtime(formData.postalCode)
    if (!postalCodeValidation.isValid) {
      setErrors({ ...errors, postalCode: postalCodeValidation.errors[0] })
      return
    }

    // 郵便番号が正しい場合はエラーをクリア
    setErrors(prev => ({ ...prev, postalCode: undefined }))

    setIsSearchingAddress(true)

    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`

    try {
      // Next.js API ルート経由で住所検索
      const response = await fetch(apiUrl)

      const data = await response.json()

      if (data.success && data.address) {
        // 住所が見つかった場合
        setFormData(prev => ({
          ...prev,
          address: data.address
        }))

        // 住所が見つかった場合は郵便番号と住所のエラーをクリア
        setErrors(prev => ({
          ...prev,
          postalCode: undefined,
          address: undefined
        }))
      } else {
        // 住所が見つからない場合はエラーメッセージを表示
        setErrors(prev => ({
          ...prev,
          postalCode: '該当する住所が見つかりませんでした。郵便番号を確認するか、住所を直接入力してください。'
        }))

        // 住所フィールドにフォーカスを移す
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }

    } catch (error) {
      // ネットワークエラーなどの場合
      setErrors(prev => ({
        ...prev,
        postalCode: '住所検索中にエラーが発生しました。しばらくしてから再度お試しください。'
      }))

      // エラー時も住所フィールドにフォーカス
      setTimeout(() => {
        if (addressInputRef.current) {
          addressInputRef.current.focus()
        }
      }, 100)
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const updateFormData = (field: keyof ProfileEditInput, value: string) => {
    setFormData({ ...formData, [field]: value as any })

    // リアルタイムバリデーション
    if (field === 'nickname') {
      const nicknameValidation = validateNicknameRealtime(value)
      if (nicknameValidation.isValid) {
        setErrors({ ...errors, nickname: undefined })
      } else if (nicknameValidation.errors.length > 0) {
        setErrors({ ...errors, nickname: nicknameValidation.errors[0] })
      }
    } else if (field === 'postalCode') {
      const postalCodeValidation = validatePostalCodeRealtime(value)
      if (postalCodeValidation.isValid) {
        setErrors({ ...errors, postalCode: undefined })
      } else if (postalCodeValidation.errors.length > 0) {
        setErrors({ ...errors, postalCode: postalCodeValidation.errors[0] })
      }
    } else if (field === 'birthDate') {
      const birthDateValidation = validateBirthDateRealtime(value)
      if (birthDateValidation.isValid) {
        setErrors({ ...errors, birthDate: undefined })
      } else if (birthDateValidation.errors.length > 0) {
        setErrors({ ...errors, birthDate: birthDateValidation.errors[0] })
      }
    } else if (field !== 'address' && errors[field]) {
      // 住所フィールドは編集不可なので、住所以外のフィールドのエラーをクリア
      setErrors({ ...errors, [field]: undefined })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ニックネーム */}
      <Input
        type="text"
        label="ニックネーム"
        placeholder="ニックネームを入力"
        value={formData.nickname}
        onChange={(value) => updateFormData("nickname", value)}
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
              placeholder="ハイフンなし7桁数字"
              value={formData.postalCode}
              onChange={(e) => updateFormData("postalCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearchingAddress}
            className="px-6 py-3 whitespace-nowrap bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearchingAddress ? "検索中..." : "住所検索"}
          </button>
        </div>
        {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
      </div>

      {/* 住所表示（表示のみ） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          住所
        </label>
        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[48px] flex items-center">
          {formData.address || "住所検索ボタンで住所を取得してください"}
        </div>
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* 生年月日 */}
      <DateSelect
        label="生年月日"
        value={formData.birthDate}
        onChange={(value) => updateFormData("birthDate", value)}
        error={errors.birthDate}
      />

      {/* 性別 */}
      <RadioButton
        name="gender"
        label="性別"
        options={genderOptions}
        value={formData.gender}
        onChange={(value) => updateFormData("gender", value)}
        error={errors.gender}
      />

      {/* 登録店舗 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          登録店舗
        </label>
        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[48px] flex items-center">
          {formData.registeredStore || "店舗QRコードから登録された店舗です"}
        </div>
        <p className="mt-1 text-xs text-gray-500">※店舗QRコードから登録された店舗です</p>
      </div>

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