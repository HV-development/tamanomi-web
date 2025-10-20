"use client"

import { CreditCard, AlertCircle, Link as LinkIcon, CheckCircle, Smartphone, Copy } from "lucide-react"
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
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 space-y-6">
          {/* 割引強調セクション */}
          <div className="text-center bg-white/80 rounded-lg p-6 shadow-sm">
            <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full mb-4">
              <p className="text-sm font-bold">さらにお得に！</p>
            </div>
            <div className="mb-4">
              <p className="text-5xl font-black text-amber-600 mb-2">
                ¥480
                <span className="text-2xl ml-2">OFF</span>
              </p>
              <p className="text-gray-700 font-medium">
                さいたま市みんなのアプリ連携で
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                月額480円でご利用いただけます
              </p>
            </div>
          </div>

          {/* アプリ説明セクション */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">さいたま市みんなのアプリについて</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  さいたま市が提供する公式アプリです。アプリと連携することで、特別な割引価格でご利用いただけます。
                </p>
              </div>
            </div>

            {/* アプリダウンロードリンク */}
            <div className="bg-white/60 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900 text-center mb-3">
                まだアプリをお持ちでない方はこちらからダウンロード
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href="https://apps.apple.com/jp/app/%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA/id6502677802"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/app-store-badge.svg"
                    alt="App Storeからダウンロード"
                    width={140}
                    height={47}
                    className="h-[47px] w-auto"
                  />
                </a>
                <a
                  href="http://play.google.com/store/apps/details?id=jp.saitamacity.rsa&hl=ja&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/google-play-badge.png"
                    alt="Google Playで手に入れよう"
                    width={157}
                    height={47}
                    className="h-[47px] w-auto"
                  />
                </a>
              </div>
            </div>

            {/* ID取得手順 */}
            <div className="bg-white/60 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Copy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">ユーザーIDの確認方法</h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>さいたま市みんなのアプリを開く</li>
                    <li>画面下部のメニューから「マイページ」をタップ</li>
                    <li>「ユーザーID」が表示されます</li>
                    <li>IDをタップしてコピー</li>
                    <li>下記の入力欄に貼り付けてください</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {linkError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">{linkError}</p>
            </div>
          )}

          {/* 入力フォーム */}
          <div className="space-y-3 bg-white/60 rounded-lg p-4">
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
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 text-base font-bold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <LinkIcon className="w-5 h-5" />
              {isLinking ? "連携処理中..." : "アプリと連携して480円OFFで利用する"}
            </Button>
            <p className="text-xs text-center text-gray-600">
              ※ 連携後、すぐに割引価格が適用されます
            </p>
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