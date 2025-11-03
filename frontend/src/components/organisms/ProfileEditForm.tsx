"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/atoms/Input"
import { Button } from "@/components/atoms/Button"
import { RadioButton } from "@/components/atoms/RadioButton"
import { ProfileEditConfirmModal } from "./ProfileEditConfirmModal"
import type { User } from "@/types/user"
import {
  profileEditSchema,
  type ProfileEditInput,
  validateNicknameRealtime,
  validatePostalCodeRealtime,
  validatePhoneRealtime,
} from "@hv-development/schemas"

interface ProfileEditFormProps {
  user: User
  onSubmit: (data: ProfileEditInput) => void
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
    phone: "",
    saitamaAppId: "",
  })

  const [originalData, setOriginalData] = useState<ProfileEditInput>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
    phone: "",
    saitamaAppId: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileEditInput, string>>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

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

    const initialData: ProfileEditInput = {
      nickname: user.nickname || "",
      postalCode: user.postalCode || "",
      address: user.address || "",
      birthDate: formatBirthDate(user.birthDate),
      gender: (user.gender as "male" | "female" | "other") || "male",
      phone: user.phone || "",
      saitamaAppId: (user as User & { saitamaAppId?: string }).saitamaAppId || "",
    }
    setFormData(initialData)
    setOriginalData(initialData)
  }, [user])

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const fieldLabels = {
    nickname: "ニックネーム",
    postalCode: "郵便番号",
    address: "住所",
    birthDate: "生年月日",
    gender: "性別",
    phone: "電話番号",
    saitamaAppId: "さいたま市みんなのアプリID",
  } as const

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
        const newErrors: Partial<Record<keyof ProfileEditInput, string>> = {}
        zodError.errors.forEach((err) => {
          const field = err.path?.[0] as keyof ProfileEditInput
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // ローディング中は処理を停止
    if (isLoading) {
      return
    }
    
    if (validateForm()) {
      const updatedFields = getUpdatedFieldsWithValues()
      
      // 変更がない場合は直接API呼び出し
      if (updatedFields.length === 0) {
        onSubmit(formData)
      } else {
        // 変更がある場合は確認モーダルを表示
        setIsConfirmModalOpen(true)
      }
    }
  }

  const handleConfirm = () => {
    // モーダルを閉じてからAPI呼び出し
    setIsConfirmModalOpen(false)
    onSubmit(formData)
  }

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(false)
  }

  const getUpdatedFieldsWithValues = () => {
    const fields: Array<{ label: string; newValue: string }> = []
    
    Object.keys(formData).forEach((key) => {
      const fieldKey = key as keyof ProfileEditInput
      // 生年月日と住所は編集不可なので除外
      if (fieldKey === 'birthDate' || fieldKey === 'address') {
        return
      }
      
      if (formData[fieldKey] !== originalData[fieldKey]) {
        if (fieldKey in fieldLabels) {
          let displayValue = String(formData[fieldKey] || "")
          
          // 性別を日本語に変換
          if (fieldKey === 'gender') {
            const genderOption = genderOptions.find(opt => opt.value === formData[fieldKey])
            displayValue = genderOption?.label || displayValue
          }
          
          fields.push({
            label: fieldLabels[fieldKey as keyof typeof fieldLabels],
            newValue: displayValue
          })
        }
      }
    })
    
    return fields
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

    } catch {
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
    setFormData({ ...formData, [field]: value })

    // リアルタイムバリデーション（入力中はフォーマットエラーのみチェック）
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
    } else if (field === 'phone') {
      const phoneValidation = validatePhoneRealtime(value)
      if (phoneValidation.isValid) {
        setErrors({ ...errors, phone: undefined })
      } else if (phoneValidation.errors.length > 0) {
        setErrors({ ...errors, phone: phoneValidation.errors[0] })
      }
    } else if (field !== 'address' && field !== 'birthDate' && errors[field]) {
      // 住所と生年月日は編集不可なので、エラーをクリア
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleBlur = (field: keyof ProfileEditInput) => {
    // フォーカスが外れた時に必須チェックを含む完全なバリデーションを実行
    const value = formData[field]
    
    try {
      // フィールドごとに適切なバリデーションを実行
      if (field === 'nickname') {
        profileEditSchema.pick({ nickname: true }).parse({ nickname: value })
      } else if (field === 'postalCode') {
        profileEditSchema.pick({ postalCode: true }).parse({ postalCode: value })
      } else if (field === 'address') {
        profileEditSchema.pick({ address: true }).parse({ address: value })
      } else if (field === 'birthDate') {
        // 生年月日は編集不可なのでバリデーションをスキップ
        return
      } else if (field === 'phone') {
        profileEditSchema.pick({ phone: true }).parse({ phone: value })
      } else if (field === 'gender') {
        profileEditSchema.pick({ gender: true }).parse({ gender: value })
      } else if (field === 'saitamaAppId') {
        profileEditSchema.pick({ saitamaAppId: true }).parse({ saitamaAppId: value })
      }
      setErrors(prev => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> }
        if (zodError.errors.length > 0) {
          setErrors(prev => ({ ...prev, [field]: zodError.errors[0].message }))
        }
      }
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
        onBlur={() => handleBlur("nickname")}
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
              onBlur={() => handleBlur("postalCode")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearchingAddress}
            className="px-6 py-3 whitespace-nowrap bg-transparent hover:bg-green-50 text-green-600 rounded-lg border-2 border-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* 生年月日表示（表示のみ・更新対象外） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          生年月日
        </label>
        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[48px] flex items-center">
          {formData.birthDate || "生年月日は登録できません"}
        </div>
      </div>

      {/* 電話番号 */}
      <Input
        type="tel"
        label="電話番号"
        placeholder="09012345678（ハイフンなし）"
        value={formData.phone || ""}
        onChange={(value) => updateFormData("phone", value)}
        onBlur={() => handleBlur("phone")}
        error={errors.phone}
        required={true}
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

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          確認する
        </Button>

        <Button type="button" onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>

      {/* 確認モーダル */}
      <ProfileEditConfirmModal
        isOpen={isConfirmModalOpen}
        updatedFields={getUpdatedFieldsWithValues()}
        onConfirm={handleConfirm}
        onCancel={handleConfirmCancel}
        isLoading={isLoading}
      />
    </form>
  )
}