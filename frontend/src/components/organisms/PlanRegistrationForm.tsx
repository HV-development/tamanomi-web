"use client"

import { CreditCard, AlertCircle, CheckCircle, Smartphone, QrCode } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { PlanCard } from "@/components/molecules/PlanCard"
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { Modal } from "@/components/atoms/Modal"
import { FadeInComponent } from "@/components/atoms/ProgressiveLoader"
import { PlanListResponse } from '@hv-development/schemas'
import type { PaymentMethodType } from '@/types/payment'
import { ApiClient } from '@/lib/api-client';

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: (planId: string, paymentMethod: PaymentMethodType) => void
  onCancel: () => void
  isLoading?: boolean
  plans: PlanListResponse['plans']
  error?: string
  saitamaAppLinked?: boolean
  onSaitamaAppLinked?: () => void
  hasPaymentMethod?: boolean
  isPaymentMethodChangeOnly?: boolean
}

// プラン表示完了を検知するコンポーネント
const PlanFadeIn = ({ children, delay, onDisplayed }: { 
  children: React.ReactNode
  delay: number
  onDisplayed: () => void 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (isVisible) {
      // フェードインアニメーション完了後に通知（500ms + 少しのマージン）
      const timer = setTimeout(() => {
        onDisplayed()
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDisplayed])

  return (
    <div
      className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  )
}

export function PlanRegistrationForm({ 
  onPaymentMethodRegister, 
  isLoading = false,
  plans,
  error,
  saitamaAppLinked = false,
  onSaitamaAppLinked,
  hasPaymentMethod = false,
  isPaymentMethodChangeOnly = false,
}: PlanRegistrationFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans.length > 0 ? plans[0].id : "")
  const [saitamaAppId, setSaitamaAppId] = useState<string>("")
  const [linkedSaitamaAppId, setLinkedSaitamaAppId] = useState<string>("")
  const [linkError, setLinkError] = useState<string>("")
  const [isLinking, setIsLinking] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('CreditCard')
  const [allPlansDisplayed, setAllPlansDisplayed] = useState(false)
  const displayedPlansCount = useRef(0)

  // 選択中のプランがサブスクリプションプランかを判定
  const selectedPlanData = plans.find(p => p.id === selectedPlan)
  const isSubscriptionPlan = selectedPlanData?.is_subscription ?? false

  // プラン数が変わったら表示カウントをリセット
  useEffect(() => {
    displayedPlansCount.current = 0
    setAllPlansDisplayed(false)
  }, [plans.length])

  // プランが表示完了したことを記録
  const handlePlanDisplayed = () => {
    displayedPlansCount.current += 1
    if (displayedPlansCount.current >= plans.length && plans.length > 0) {
      setAllPlansDisplayed(true)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    // サブスクリプションプランを選択した場合、支払い方法をクレジットカードに自動切り替え
    const plan = plans.find(p => p.id === planId)
    if (plan?.is_subscription && (selectedPaymentMethod === 'AeonPay' || selectedPaymentMethod === 'PayPay')) {
      setSelectedPaymentMethod('CreditCard')
    }
  }

  const handlePaymentRegister = () => {
    if (!selectedPlan && !isPaymentMethodChangeOnly) {
      return
    }

    if (selectedPlan || isPaymentMethodChangeOnly) {
      onPaymentMethodRegister(selectedPlan, selectedPaymentMethod)
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
      const result = await ApiClient.post('/api/user/link-saitama-app', {
        saitamaAppId: saitamaAppId.trim()
      })

      if (result.error) {
        setLinkError(result.error.message || "連携に失敗しました")
        setIsLinking(false)
        return
      }

      const data = result.data as { pointsGranted?: number }
      
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
    } catch {
      setLinkError('さいたま市アプリ連携中にエラーが発生しました')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPaymentMethodChangeOnly ? '支払い方法の変更' : 'プラン登録'}
        </h2>
        <p className="text-gray-600">
          {isPaymentMethodChangeOnly ? 'クレジットカード情報を変更してください' : 'ご希望のプランを選択してください'}
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 連携完了表示（連携済みまたは連携したIDがある場合、支払い方法変更のみの場合は非表示） */}
      {!isPaymentMethodChangeOnly && (saitamaAppLinked || linkedSaitamaAppId) && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">さいたま市みんなのアプリ連携:</span>
              </p>
              <p className="text-xs text-gray-600 font-mono break-all mt-1">
                {linkedSaitamaAppId || '連携済み'}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">✓ 連携完了</p>
            </div>
          </div>
        </div>
      )}

      {/* プラン選択（支払い方法変更のみの場合は非表示） */}
      {!isPaymentMethodChangeOnly && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">利用可能なプランがありません</p>
            </div>
          ) : (
          plans.map((plan, index) => {
            // 割引価格は現在のスキーマでは未対応のため、通常価格のみ表示
            const displayPrice = plan.price;
            const hasDiscount = false;
            
            // さいたま市アプリ連携済みの場合の価格表示
            const isSaitamaLinked = saitamaAppLinked || linkedSaitamaAppId;
            const saitamaDiscountPrice = 480; // さいたま市アプリ連携時の価格
            
            // さいたま市アプリ連携済みで、通常価格が980円の場合
            if (isSaitamaLinked && plan.price === 980) {
              return (
                <PlanFadeIn key={plan.id} delay={index * 100} onDisplayed={handlePlanDisplayed}>
                  <PlanCard
                    title={plan.name}
                    description={plan.description || ''}
                    features={plan.plan_content?.features || []}
                    price={`¥${saitamaDiscountPrice.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                    originalPrice={`¥${plan.price.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                    badge={plan.status === 'active' ? 'さいたま市アプリ連携でお得' : undefined}
                    isSelected={selectedPlan === plan.id}
                    onSelect={() => handlePlanSelect(plan.id)}
                  />
                </PlanFadeIn>
              );
            }
            
            return (
              <PlanFadeIn key={plan.id} delay={index * 100} onDisplayed={handlePlanDisplayed}>
                <PlanCard
                  title={plan.name}
                  description={plan.description || ''}
                  features={plan.plan_content?.features || []}
                  price={`¥${displayPrice.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                  originalPrice={hasDiscount ? `¥${plan.price.toLocaleString()}${plan.is_subscription ? '/月' : ''}` : undefined}
                  badge={plan.status === 'active' ? '利用可能' : undefined}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              </PlanFadeIn>
            );
          })
        )}
        </div>
      )}

      {/* さいたま市みんなのアプリ連携フォーム（未連携の場合のみ表示、支払い方法変更のみの場合は非表示） */}
      {!isPaymentMethodChangeOnly && !saitamaAppLinked && !linkedSaitamaAppId && allPlansDisplayed && (
        <FadeInComponent delay={0}>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 space-y-4">
            {/* 割引強調セクション */}
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full mb-3">
                <p className="text-sm font-bold">さらにお得に！</p>
              </div>
              <div className="mb-3">
                <div className="flex flex-col items-center">
                  <span className="text-sm line-through text-gray-500 mb-1">
                    ¥980/月
                  </span>
                  <p className="text-3xl font-bold text-blue-600 mb-1">
                    ¥480/月
                  </p>
                  <p className="text-gray-700 text-sm font-medium">
                    さいたま市みんなのアプリ連携で
                  </p>
                  <p className="text-sm font-bold text-indigo-700">
                    月額480円でご利用いただけます
                  </p>
                </div>
              </div>
            </div>

          {/* アプリ説明とダウンロードリンク */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">さいたま市みんなのアプリ</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                さいたま市が提供する公式アプリです。<br />
                アプリと連携することで、特別な割引価格でご利用いただけます。
              </p>
            </div>

            {/* ダウンロードリンク */}
            <div className="space-y-3">
              <div className="flex justify-center gap-3">
                <a
                  href="https://apps.apple.com/jp/app/%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA/id6502677802"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/app-store.svg" alt="App Storeからダウンロード" width={100} height={48} className="h-12" />
                </a>
                <a
                  href="http://play.google.com/store/apps/details?id=jp.saitamacity.rsa&hl=ja&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/google-play.svg" alt="Google Playで手に入れよう" width={120} height={48} className="h-12" />
                </a>
              </div>
              <div className="text-center">
                <a
                  href="/saitama-app-guide"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  ユーザーID取得手順はこちら
                </a>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {linkError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{linkError}</p>
            </div>
          )}

          {/* 入力フォーム */}
          <div className="space-y-3 bg-white rounded-lg p-4">
            <Input
              label={
                <>
                  さいたま市みんなのアプリ
                  <br />
                  ユーザーID
                </>
              }
              value={saitamaAppId}
              onChange={(value) => {
                setSaitamaAppId(value)
                setLinkError("")
              }}
              placeholder="saitamacity_xxxxxx"
              disabled={isLinking}
            />
            <button 
              onClick={handleLinkSaitamaApp}
              disabled={isLinking || !saitamaAppId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 text-sm font-bold flex items-center justify-center gap-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLinking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  連携処理中...
                </>
              ) : (
                <span className="text-center">
                  アプリと連携して
                  <br />
                  500円OFFで利用する
                </span>
              )}
            </button>
            <p className="text-xs text-center text-gray-600">
              ※ 連携後すぐに割引価格が適用されます
            </p>
          </div>
          </div>
        </FadeInComponent>
      )}

      {/* 支払い方法選択（単発プランのみ有効） */}
      {!isPaymentMethodChangeOnly && plans.some(plan => !plan.is_subscription) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">支払い方法</h3>
          <div className="grid grid-cols-1 gap-3">
            {/* クレジットカード */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('CreditCard')}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                selectedPaymentMethod === 'CreditCard'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">クレジットカード</p>
                </div>
              </div>
            </button>

            {/* イオンペイ */}
            <button
              type="button"
              onClick={() => !isSubscriptionPlan && setSelectedPaymentMethod('AeonPay')}
              disabled={isSubscriptionPlan}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                isSubscriptionPlan
                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                  : selectedPaymentMethod === 'AeonPay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <QrCode className={`w-5 h-5 ${isSubscriptionPlan ? 'text-gray-400' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isSubscriptionPlan ? 'text-gray-500' : 'text-gray-900'}`}>イオンペイ</p>
                  {isSubscriptionPlan && (
                    <p className="text-xs text-gray-500 mt-1">利用できません</p>
                  )}
                </div>
              </div>
            </button>

            {/* PayPay */}
            <button
              type="button"
              onClick={() => !isSubscriptionPlan && setSelectedPaymentMethod('PayPay')}
              disabled={isSubscriptionPlan}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                isSubscriptionPlan
                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                  : selectedPaymentMethod === 'PayPay'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className={`w-5 h-5 ${isSubscriptionPlan ? 'text-gray-400' : 'text-red-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isSubscriptionPlan ? 'text-gray-500' : 'text-gray-900'}`}>PayPay</p>
                  {isSubscriptionPlan && (
                    <p className="text-xs text-gray-500 mt-1">利用できません</p>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 支払い方法登録・変更ボタン */}
      <div className="space-y-3">
        <Button
          onClick={handlePaymentRegister}
          disabled={isLoading || (!isPaymentMethodChangeOnly && (plans.length === 0 || !selectedPlan))}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-5 h-5" />
          {isLoading ? "処理中..." : isPaymentMethodChangeOnly ? "支払い方法を変更する" : (hasPaymentMethod ? "プランに登録する" : "支払い方法を登録する")}
        </Button>
        
        {/* 支払い方法変更ボタン（カード登録済みの場合のみ表示、支払い方法変更のみの場合は非表示） */}
        {hasPaymentMethod && !isPaymentMethodChangeOnly && (
          <Button
            onClick={() => {
              // 既存プランを選択せず、支払い方法のみ変更
            onPaymentMethodRegister("", 'CreditCard')
            }}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            {isLoading ? "処理中..." : "支払い方法を変更する"}
          </Button>
        )}
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