"use client"

import { CreditCard, AlertCircle, Link as LinkIcon, CheckCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"
import { Input } from "../atoms/input"
import { Modal } from "../atoms/modal"
import { PlanListResponse } from '@hv-development/schemas'

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  isLoading?: boolean
  plans: PlanListResponse['plans']
  error?: string
  saitamaAppLinked?: boolean
  onSaitamaAppLinked?: () => void
}

export function PlanRegistrationForm({ 
  onPaymentMethodRegister, 
  isLoading = false,
  plans,
  error,
  saitamaAppLinked = false,
  onSaitamaAppLinked,
}: PlanRegistrationFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans.length > 0 ? plans[0].id : "")
  const [saitamaAppId, setSaitamaAppId] = useState<string>("")
  const [linkedSaitamaAppId, setLinkedSaitamaAppId] = useState<string>("")
  const [linkError, setLinkError] = useState<string>("")
  const [isLinking, setIsLinking] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>("")

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handlePaymentRegister = () => {
    if (selectedPlan) {
      onPaymentMethodRegister(selectedPlan)
    }
  }

  const handleLinkSaitamaApp = async () => {
    if (!saitamaAppId || saitamaAppId.trim() === "") {
      setLinkError("さいたま市アプリIDを入力してください")
      return
    }

    setIsLinking(true)
    setLinkError("")

    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        setLinkError("認証情報が見つかりません。再度ログインしてください。")
        setIsLinking(false)
        return
      }

      const response = await fetch('/api/user/link-saitama-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ saitamaAppId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLinkError(data.error || 'さいたま市アプリ連携に失敗しました')
        setIsLinking(false)
        return
      }
      
      // 連携したIDを保存
      setLinkedSaitamaAppId(saitamaAppId)
      
      // モーダル用のメッセージを作成
      const pointsMessage = typeof data.pointsGranted === 'number' && data.pointsGranted > 0
        ? `${data.pointsGranted}ポイントを付与しました！` 
        : 'ポイントが付与されました！'
      setModalMessage(`さいたま市みんなのアプリとの連携が完了しました。\n\n${pointsMessage}\n\nお得なプランが表示されます。`)
      
      // モーダルを表示
      setShowSuccessModal(true)
      
      // 入力フィールドをクリア
      setSaitamaAppId("")
      
      // 連携成功後、プランを再取得するために親コンポーネントに通知
      if (onSaitamaAppLinked) {
        await onSaitamaAppLinked()
      }
    } catch (err) {
      console.error('Link saitama app error:', err)
      setLinkError('さいたま市アプリ連携中にエラーが発生しました')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">プラン登録</h2>
        <p className="text-gray-600">ご希望のプランを選択してください</p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* プラン選択 */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">利用可能なプランがありません</p>
          </div>
        ) : (
          plans.map((plan) => {
            // 割引価格がある場合は割引価格を表示、ない場合は通常価格を表示
            const displayPrice = plan.discount_price ? plan.discount_price : plan.price;
            const hasDiscount = plan.discount_price && plan.discount_price < plan.price;
            
            return (
              <PlanCard
                key={plan.id}
                title={plan.name}
                description={plan.description || ''}
                features={plan.plan_content?.features || []}
                price={`¥${displayPrice.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                originalPrice={hasDiscount ? `¥${plan.price.toLocaleString()}${plan.is_subscription ? '/月' : ''}` : undefined}
                badge={plan.status === 'active' ? '利用可能' : undefined}
                isSelected={selectedPlan === plan.id}
                onSelect={() => handlePlanSelect(plan.id)}
              />
            );
          })
        )}
      </div>

      {/* 連携完了表示（連携済みまたは連携したIDがある場合） */}
      {(saitamaAppLinked || linkedSaitamaAppId) && (
        <div className="py-3 px-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">さいたま市みんなのアプリ連携:</span> {linkedSaitamaAppId || '連携済み'}
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">連携完了</p>
          </div>
        </div>
      )}

      {/* さいたま市みんなのアプリ連携フォーム（未連携の場合のみ表示） */}
      {!saitamaAppLinked && !linkedSaitamaAppId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              さらにお得に！
            </h3>
            <p className="text-amber-800 text-sm">
              さいたま市みんなのアプリと連携すると、<span className="font-bold text-amber-900">480円でさらにお得</span>になります
            </p>
          </div>

          {linkError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">{linkError}</p>
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="さいたま市みんなのアプリID"
              value={saitamaAppId}
              onChange={(value) => {
                setSaitamaAppId(value)
                setLinkError("")
              }}
              placeholder="アプリIDを入力してください"
              disabled={isLinking}
            />
            <Button
              onClick={handleLinkSaitamaApp}
              disabled={isLinking || !saitamaAppId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-base font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <LinkIcon className="w-5 h-5" />
              {isLinking ? "連携処理中..." : "さいたま市みんなのアプリと連携する"}
            </Button>
          </div>
        </div>
      )}

      {/* 支払い方法登録ボタン */}
      <div>
        <Button
          onClick={handlePaymentRegister}
          disabled={isLoading || plans.length === 0 || !selectedPlan}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? "処理中..." : "支払い方法を登録する"}
        </Button>
      </div>

      {/* カードブランドロゴ */}
      <div className="flex flex-col items-center gap-3 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4">
          <Image 
            src="/visa.png" 
            alt="VISA" 
            width={60} 
            height={40}
            className="object-contain"
          />
          <Image 
            src="/master.png" 
            alt="Mastercard" 
            width={60} 
            height={40}
            className="object-contain"
          />
        </div>
        <p className="text-sm text-gray-600">現在はVISA、MASTERのみ利用できます</p>
      </div>

      {/* 注意事項 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>※ 支払い方法の登録にはイオンレジのシステムを使用します</p>
        <p>※ 登録情報は暗号化されて安全に保護されます</p>
      </div>

      {/* 連携成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 連携完了"
      >
        <div className="space-y-4">
          <p className="text-gray-700 whitespace-pre-line">{modalMessage}</p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            確認
          </Button>
        </div>
      </Modal>
    </div>
  )
}