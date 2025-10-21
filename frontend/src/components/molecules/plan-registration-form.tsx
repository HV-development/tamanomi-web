"use client"

import { CreditCard, AlertCircle, Link as LinkIcon, CheckCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { PlanCard } from "../atoms/plan-card"
import { Button } from "../atoms/button"
import { Input } from "../atoms/input"
import { Modal } from "../atoms/modal"
import { PlanListResponse } from '@hv-development/schemas'
import { ApiClient } from '../../lib/api-client';

interface PlanRegistrationFormProps {
  onPaymentMethodRegister: (planId: string) => void
  onCancel: () => void
  isLoading?: boolean
  plans: PlanListResponse['plans']
  error?: string
  saitamaAppLinked?: boolean
  onSaitamaAppLinked?: () => void
  hasPaymentMethod?: boolean
  isPaymentMethodChangeOnly?: boolean
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

      {/* プラン選択（支払い方法変更のみの場合は非表示） */}
      {!isPaymentMethodChangeOnly && (
        <div className="space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">利用可能なプランがありません</p>
            </div>
          ) : (
          plans.map((plan) => {
            // 割引価格は現在のスキーマでは未対応のため、通常価格のみ表示
            const displayPrice = plan.price;
            const hasDiscount = false;
            
            // さいたま市アプリ連携済みの場合の価格表示
            const isSaitamaLinked = saitamaAppLinked || linkedSaitamaAppId;
            const saitamaDiscountPrice = 480; // さいたま市アプリ連携時の価格
            
            // さいたま市アプリ連携済みで、通常価格が980円の場合
            if (isSaitamaLinked && plan.price === 980) {
              return (
                <PlanCard
                  key={plan.id}
                  title={plan.name}
                  description={plan.description || ''}
                  features={plan.plan_content?.features || []}
                  price={`¥${saitamaDiscountPrice.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                  originalPrice={`¥${plan.price.toLocaleString()}${plan.is_subscription ? '/月' : ''}`}
                  badge={plan.status === 'active' ? 'さいたま市アプリ連携でお得' : undefined}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              );
            }
            
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

      {/* さいたま市みんなのアプリ連携フォーム（未連携の場合のみ表示、支払い方法変更のみの場合は非表示） */}
      {!isPaymentMethodChangeOnly && !saitamaAppLinked && !linkedSaitamaAppId && (
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
              <h4 className="font-bold text-gray-900 text-sm mb-1">さいたま市みんなのアプリについて</h4>
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
                  アプリの使い方とユーザーID取得手順はこちら
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
              label="さいたま市みんなのアプリ ユーザーID"
              value={saitamaAppId}
              onChange={(value) => {
                setSaitamaAppId(value)
                setLinkError("")
              }}
              placeholder="ユーザーIDを入力してください"
              disabled={isLinking}
            />
            <Button
              onClick={handleLinkSaitamaApp}
              disabled={isLinking || !saitamaAppId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <LinkIcon className="w-4 h-4" />
              {isLinking ? "連携処理中..." : "アプリと連携して500円OFFで利用する"}
            </Button>
            <p className="text-xs text-center text-gray-600">
              ※ 連携後、すぐに割引価格が適用されます
            </p>
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
              onPaymentMethodRegister("")
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