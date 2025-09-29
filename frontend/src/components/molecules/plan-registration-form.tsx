"use client"

import { Crown, CreditCard, Check } from "lucide-react"
import { Button } from "../atoms/button"

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function PlanRegistrationForm({ 
  onPaymentMethodRegister, 
  onCancel, 
  isLoading = false 
}: PlanRegistrationFormProps) {
  // デフォルトプラン情報（実際の実装では props で受け取る）
  const planInfo = {
    name: "マンスリープラン",
    price: 980,
    description: "毎日お得にお酒を楽しめる定番プラン",
    features: [
      "1日1杯お酒が無料",
      "さいたま市内の加盟店で利用可能", 
      "いつでもキャンセル可能"
    ]
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">プラン登録</h2>
        <p className="text-gray-600">選択されたプランの詳細をご確認ください</p>
      </div>

      {/* プラン詳細カード */}
      <div className="bg-white border-2 border-green-300 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <Crown className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">選択されたプラン</h3>
            <p className="text-sm text-gray-600">プラン詳細情報</p>
          </div>
        </div>

        {/* プラン情報 */}
        <div className="space-y-4">
          {/* プラン名 */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-center">
              <h4 className="text-xl font-bold text-green-900 mb-2">{planInfo.name}</h4>
              <div className="text-3xl font-bold text-green-600">¥{planInfo.price.toLocaleString()}</div>
              <div className="text-sm text-green-700 mt-1">月額料金（税込）</div>
            </div>
          </div>

          {/* プラン内容 */}
          <div className="space-y-3">
            <h5 className="text-lg font-bold text-gray-900">プラン内容</h5>
            <p className="text-gray-700 leading-relaxed">{planInfo.description}</p>
            
            <div className="space-y-2">
              {planInfo.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 重要事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h4 className="text-blue-900 font-bold mb-3">ご利用について</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 初回請求は登録完了後に行われます</li>
          <li>• プランはいつでも変更・キャンセル可能です</li>
          <li>• 決済は安全なシステムで処理されます</li>
          <li>• ご不明な点はお問い合わせください</li>
        </ul>
      </div>

      {/* 支払い方法登録ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onPaymentMethodRegister}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? "処理中..." : "支払い方法を登録する"}
        </Button>

        <Button 
          onClick={onCancel} 
          variant="secondary" 
          className="w-full py-3 text-base font-medium"
        >
          キャンセル
        </Button>
      </div>

      {/* 注意事項 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>※ 支払い方法の登録にはイオンレジのシステムを使用します</p>
        <p>※ 登録情報は暗号化されて安全に保護されます</p>
      </div>
    </div>
  )
}