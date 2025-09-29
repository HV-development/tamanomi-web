"use client"

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "../atoms/button"

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

interface RegisterConfirmationDisplayProps {
  data: RegisterFormData
  email?: string
  onRegister: () => void
  onEdit: () => void
  isLoading?: boolean
}

export function RegisterConfirmationDisplay({ 
  data, 
  email, 
  onRegister, 
  onEdit, 
  isLoading = false 
}: RegisterConfirmationDisplayProps) {
  const genderLabels = {
    male: "男性",
    female: "女性",
    other: "その他",
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy年M月d日", { locale: ja })
  }

  const confirmationItems = [
    { label: "ニックネーム", value: data.nickname },
    { label: "郵便番号", value: data.postalCode },
    { label: "住所", value: data.address },
    { label: "生年月日", value: formatDate(data.birthDate) },
    { label: "性別", value: genderLabels[data.gender as keyof typeof genderLabels] },
    { label: "パスワード", value: "●".repeat(data.password.length) },
    { label: "パスワード確認", value: "●".repeat(data.passwordConfirm.length) },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">登録内容の確認</h2>
        <p className="text-gray-600">以下の内容で登録します。よろしければ「登録する」ボタンを押してください。</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        {confirmationItems.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-700 w-1/3">{item.label}</span>
            <span className="text-sm text-gray-900 w-2/3 text-right break-words">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button
          onClick={onRegister}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "登録中..." : "登録する"}
        </Button>

        <Button 
          onClick={onEdit} 
          variant="secondary" 
          className="w-full py-3 text-base font-medium"
        >
          登録内容を修正する
        </Button>
      </div>
    </div>
  )
}