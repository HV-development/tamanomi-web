"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateInput } from "../atoms/date-input"
import type { User } from "../../types/user"

interface ProfileEditFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
  registeredStore: string
}

interface ProfileEditFormProps {
  user: User
  onSubmit: (data: ProfileEditFormData, updatedFields: string[]) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ProfileEditForm({ user, onSubmit, onCancel, onWithdraw, isLoading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileEditFormData>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "",
    saitamaAppId: "",
    registeredStore: "",
  })

  const [originalData, setOriginalData] = useState<ProfileEditFormData>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "",
    saitamaAppId: "",
    registeredStore: "",
  })

  const [errors, setErrors] = useState<Partial<ProfileEditFormData>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  
  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  // ユーザーデータでフォームを初期化
  useEffect(() => {
    const initialData = {
      nickname: user.nickname || "",
      postalCode: user.postalCode || "",
      address: user.address || "",
      birthDate: user.birthDate || "",
      gender: user.gender || "",
      saitamaAppId: user.saitamaAppId || "",
      registeredStore: user.registeredStore || "",
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
    saitamaAppId: "さいたま市みんなのアプリID",
    registeredStore: "登録店舗",
  }

  const getUpdatedFields = () => {
    const updatedFields: string[] = []

    Object.keys(formData).forEach((key) => {
      const fieldKey = key as keyof ProfileEditFormData
      if (formData[fieldKey] !== originalData[fieldKey]) {
        updatedFields.push(fieldLabels[fieldKey])
      }
    })

    return updatedFields
  }

  const validateForm = () => {
    const newErrors: Partial<ProfileEditFormData> = {}

    // ニックネーム
    if (!formData.nickname) {
      newErrors.nickname = "ニックネームを入力してください。"
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = "ニックネームは20文字以内で入力してください。"
    } else if (formData.nickname.includes("-")) {
      newErrors.nickname = "ニックネームにハイフンは使用できません。"
    }

    // 郵便番号
    if (!formData.postalCode) {
      newErrors.postalCode = "郵便番号を入力してください。"
    } else if (!/^\d{7}$/.test(formData.postalCode.replace(/-/g, ""))) {
      newErrors.postalCode = "郵便番号は7桁の数字で入力してください。"
    }

    // 住所
    if (!formData.address.trim()) {
      newErrors.address = "住所を入力してください。"
    }

    // 生年月日
    if (!formData.birthDate) {
      newErrors.birthDate = "生年月日を入力してください。"
    }

    // 性別
    if (!formData.gender) {
      newErrors.gender = "性別を選択してください。"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
    
    console.log("🔍 住所検索開始:", cleanedPostalCode)
    
    // 郵便番号の基本バリデーション
    if (!formData.postalCode) {
      setErrors({ ...errors, postalCode: "郵便番号を入力してください。" })
      console.log("❌ 郵便番号が空です")
      return
    }
    
    if (!/^\d{7}$/.test(cleanedPostalCode)) {
      setErrors({ ...errors, postalCode: "郵便番号は7桁の数字で入力してください。" })
      console.log("❌ 郵便番号の形式が正しくありません:", cleanedPostalCode)
      return
    }

    // 郵便番号が正しい場合はエラーをクリア
    setErrors(prev => ({ ...prev, postalCode: undefined }))


    setIsSearchingAddress(true)
    
    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`
    console.log("📡 API URL:", apiUrl)
    
    try {
      // Next.js API ルート経由で住所検索
      console.log("📡 APIリクエスト送信中...")
      const response = await fetch(apiUrl)
      console.log("📡 APIレスポンス受信:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      const data = await response.json()
      console.log("📡 APIレスポンスデータ:", data)
      
      if (data.success && data.address) {
        // 住所が見つかった場合
        console.log("📍 住所検索結果:", data.data)
        console.log("📍 完全住所:", data.address)
        
        setFormData(prev => ({ 
          ...prev, 
          address: data.address 
        }))
        setErrors(prev => ({ ...prev, address: undefined }))
        console.log("✅ 住所検索成功:", data.address)
      } else {
        // 住所が見つからない場合
        console.log("❌ 住所が見つかりません:", {
          postalCode: cleanedPostalCode,
          message: data.message
        })
        setErrors(prev => ({
          ...prev,
          address: data.message || "該当する住所が見つかりませんでした。手入力で住所を入力してください。"
        }))
        
        // 住所フィールドにフォーカスを移す
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }
      
    } catch (error) {
      console.error("❌ 住所検索エラー:", {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        postalCode: cleanedPostalCode,
        apiUrl: apiUrl
      })
      setErrors(prev => ({
        ...prev,
        address: "住所検索サービスに接続できませんでした。ネットワーク接続を確認するか、手入力で住所を入力してください。"
      }))
      
      // エラー時も住所フィールドにフォーカス
      setTimeout(() => {
        if (addressInputRef.current) {
          addressInputRef.current.focus()
        }
      }, 100)
    } finally {
      setIsSearchingAddress(false)
      console.log("🔍 住所検索処理完了")
     }
  }

  const updateFormData = (field: keyof ProfileEditFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
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
              placeholder="123-4567 または 1234567"
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
      <DateInput
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

      {/* 登録店舗（表示のみ） */}
      {formData.registeredStore && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">登録店舗</label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {formData.registeredStore}
          </div>
          <p className="mt-1 text-xs text-gray-500">※店舗QRコードから登録された店舗です</p>
        </div>
      )}

      {/* さいたま市みんなのアプリID */}
      <Input
        type="text"
        label="さいたま市みんなのアプリID（任意）"
        placeholder="アプリIDを入力"
        value={formData.saitamaAppId}
        onChange={(value) => updateFormData("saitamaAppId", value)}
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
