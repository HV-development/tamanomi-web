"use client"

import { Button } from "@/components/atoms/Button"

interface ProfileEditConfirmModalProps {
  isOpen: boolean
  updatedFields: Array<{ label: string; newValue: string }>
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ProfileEditConfirmModal({
  isOpen,
  updatedFields,
  onConfirm,
  onCancel,
  isLoading = false
}: ProfileEditConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">更新内容の確認</h2>
        
        {updatedFields.length === 0 ? (
          <p className="text-gray-600 mb-6">変更された項目はありません。</p>
        ) : (
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-600 mb-3">以下の内容で更新します。</p>
            {updatedFields.map((field, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">{field.label}</div>
                <div className="text-base text-gray-900">{field.newValue}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            disabled={isLoading || updatedFields.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isLoading ? "更新中..." : "更新する"}
          </Button>
          
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
            className="w-full py-3"
          >
            内容を修正する
          </Button>
        </div>
      </div>
    </div>
  )
}

