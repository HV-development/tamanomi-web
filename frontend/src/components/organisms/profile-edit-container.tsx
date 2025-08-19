"use client"

import { UserX, ChevronRight } from "lucide-react"
import { HeaderLogo } from "../atoms/header-logo"
import { ProfileEditForm } from "../molecules/profile-edit-form"
import { ProfileUpdateSuccessModal } from "../molecules/profile-update-success-modal"
import { useState } from "react"
import type { User } from "../../types/user"

interface ProfileEditFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
}

interface ProfileEditContainerProps {
  user: User
  onSubmit: (data: ProfileEditFormData) => void
  onCancel: () => void
  onWithdraw: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function ProfileEditContainer({ user, onSubmit, onCancel, onWithdraw, onLogoClick, isLoading }: ProfileEditContainerProps) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [updatedFields, setUpdatedFields] = useState<string[]>([])

  const handleSubmit = (data: ProfileEditFormData, updatedFieldsList: string[]) => {
    setUpdatedFields(updatedFieldsList)
    onSubmit(data)
    setIsSuccessModalOpen(true)
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    onCancel() // マイページに戻る
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
        {/* ヘッダー */}
        <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onCancel} />

        {/* メインコンテンツ */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            {/* プロフィール編集セクション */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">プロフィール編集</h1>
                <p className="text-gray-600">登録情報を更新してください</p>
              </div>

              <ProfileEditForm user={user} onSubmit={handleSubmit} onCancel={onCancel} isLoading={isLoading} />
            </div>

            {/* 退会セクション */}
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <button
                onClick={onWithdraw}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors duration-200">
                    <UserX className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors duration-200" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-red-700 group-hover:text-red-800 transition-colors duration-200">退会</div>
                    <div className="text-sm text-red-600 group-hover:text-red-700 transition-colors duration-200">サービスからの退会</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 成功モーダル */}
      <ProfileUpdateSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        updatedFields={updatedFields}
      />
    </>
  )
}