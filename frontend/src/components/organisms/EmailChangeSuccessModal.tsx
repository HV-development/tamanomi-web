"use client"

import { Button } from "@/components/atoms/Button"

interface EmailChangeSuccessModalProps {
  isOpen: boolean
  newEmail: string
  onClose: () => void
}

export function EmailChangeSuccessModal({
  isOpen,
  newEmail,
  onClose
}: EmailChangeSuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ（クリック無効） */}
      <div 
        className="absolute inset-0 bg-black/50"
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          {/* 成功アイコン */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">メールアドレス変更完了</h2>
          
          <div className="text-gray-600 mb-6">
            <p className="mb-2">メールアドレスが正常に変更されました。</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-1">新しいメールアドレス</p>
              <p className="font-medium text-gray-900">{newEmail}</p>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              セキュリティのため、新しいメールアドレスでログインしてください。
            </p>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  )
}
