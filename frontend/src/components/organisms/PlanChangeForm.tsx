"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { PlanCard } from "@/components/molecules/PlanCard"
import { Button } from "@/components/atoms/Button"
import { Calendar, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react"
import Image from "next/image"
import { Modal } from "@/components/atoms/Modal"
import type { Plan } from "@/types/user"
import { ApiClient } from '@/lib/api-client'

interface PlanOption {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  badge?: string
  isRecommended?: boolean
  originalPrice?: string
}

interface PlanChangeFormProps {
  currentPlan: Plan
  onPlanChange: (planId: string, alsoChangePaymentMethod?: boolean) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PlanChangeForm({ currentPlan, onPlanChange, onCancel, isLoading = false }: PlanChangeFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([])
  const [saitamaAppLinked, setSaitamaAppLinked] = useState<boolean | null>(null)
  const [fetchError, setFetchError] = useState<string>("")
  const [saitamaAppId, setSaitamaAppId] = useState<string>("")
  const [linkedSaitamaAppId, setLinkedSaitamaAppId] = useState<string>("")
  const [linkError, setLinkError] = useState<string>("")
  const [isLinking, setIsLinking] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>("")
  const [alsoChangePaymentMethod, setAlsoChangePaymentMethod] = useState<boolean>(false)

  const fetchUserInfo = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        setSaitamaAppLinked(false)
        return
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const userData = await response.json()
        const newLinkedState = userData.saitamaAppLinked === true
        setSaitamaAppLinked(newLinkedState)
      } else {
        setSaitamaAppLinked(false)
      }
    } catch {
      setSaitamaAppLinked(false)
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    try {
      // さいたま市アプリ連携状態に応じてクエリパラメータを構築
      const queryParams = new URLSearchParams({
        status: 'active',
        limit: '50',
      })
      
      if (saitamaAppLinked !== null) {
        queryParams.append('saitamaAppLinked', String(saitamaAppLinked))
      }
      
      const apiUrl = `/api/plans?${queryParams.toString()}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // APIから取得したプランをPlanOption形式に変換
      const formattedPlans: PlanOption[] = data.plans.map((plan: { 
        id: string; 
        name: string; 
        price: number; 
        description?: string; 
        features?: string[]; 
        badge?: string; 
        isRecommended?: boolean; 
        originalPrice?: string 
      }) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        description: plan.description || '',
        features: plan.features || [],
        badge: plan.badge,
        isRecommended: plan.isRecommended,
        originalPrice: plan.originalPrice,
      }))
      
      setAvailablePlans(formattedPlans)
    } catch {
      setFetchError('プランの取得に失敗しました')
    }
  }, [saitamaAppLinked])

  // ユーザー情報を取得してさいたま市アプリ連携状態を確認
  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  // プラン一覧を取得（連携状態が確定した後）
  useEffect(() => {
    if (saitamaAppLinked !== null) {
      fetchPlans()
    }
  }, [saitamaAppLinked, fetchPlans])

  const selectedPlanData = availablePlans.find((plan) => plan.id === selectedPlan)
  const isUpgrade = selectedPlanData && selectedPlanData.price > currentPlan.price
  const isDowngrade = selectedPlanData && selectedPlanData.price < currentPlan.price

  // プランリストを現在のプランを基準に並び替え
  const getSortedPlans = () => {
    if (availablePlans.length === 0) return []
    
    const plans = [...availablePlans]

    // 現在のプランのインデックスを見つける
    const currentPlanIndex = plans.findIndex((plan) => plan.id === currentPlan.id)

    if (currentPlanIndex === -1) return plans

    // 現在のプランを配列から取り出し、おすすめ位置（中央）に配置
    const currentPlanData = plans[currentPlanIndex]
    const otherPlans = plans.filter((plan) => plan.id !== currentPlan.id)

    // 価格順でソート
    const sortedOtherPlans = otherPlans.sort((a, b) => a.price - b.price)

    // 現在のプランより安いプランを前に
    const lowerPlans = sortedOtherPlans.filter((plan) => plan.price < currentPlan.price)

    // 現在のプランより高いプランを後に
    const higherPlans = sortedOtherPlans.filter((plan) => plan.price > currentPlan.price)

    // 最終的な並び順: 安いプラン → 現在のプラン → 高いプラン
    return [...lowerPlans, currentPlanData, ...higherPlans]
  }

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan.id) return // 同じプランは選択不可
    setSelectedPlan(planId)
  }

  const handleConfirm = () => {
    if (selectedPlan) {
      setShowConfirmation(true)
    }
  }

  const handleFinalConfirm = () => {
    if (selectedPlan) {
      onPlanChange(selectedPlan, alsoChangePaymentMethod)
      // プラン変更処理を実行したら、チェックボックスの状態をリセット
      setAlsoChangePaymentMethod(false)
      setShowConfirmation(false)
      setSelectedPlan("")
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
      
      // 連携成功後、プランを再取得
      await fetchUserInfo()
      await fetchPlans()
    } catch {
      setLinkError('さいたま市アプリ連携中にエラーが発生しました')
    } finally {
      setIsLinking(false)
    }
  }

  const formatNextBillingDate = () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return format(nextMonth, "yyyy年M月d日", { locale: ja })
  }

  if (showConfirmation && selectedPlanData) {
    return (
      <div className="space-y-6">
        {/* 確認ヘッダー */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更の確認</h2>
          <p className="text-gray-600">以下の内容でプランを変更します</p>
        </div>

        {/* 変更内容 */}
        <div className="space-y-4">
          {/* 現在のプラン */}
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">現在のプラン</div>
              <div className="font-bold text-gray-900">{currentPlan.name}</div>
              <div className="text-sm text-gray-700">¥{currentPlan.price.toLocaleString()}/月</div>
            </div>
          </div>

          {/* 矢印 */}
          <div className="text-center">
            <div className="text-2xl text-green-600">↓</div>
          </div>

          {/* 新しいプラン */}
          <div className="p-4 bg-green-100 rounded-xl border border-green-300">
            <div className="text-center">
              <div className="text-sm text-green-700 mb-1">新しいプラン</div>
              <div className="font-bold text-green-900">{selectedPlanData.name}</div>
              <div className="text-sm text-green-800">¥{selectedPlanData.price.toLocaleString()}/月</div>
            </div>
          </div>
        </div>

        {/* 料金変更について */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="text-sm text-yellow-900 font-bold mb-3">料金変更について</div>
          <ul className="text-sm text-yellow-800 space-y-1">
            {isUpgrade && (
              <>
                <li>• プランアップグレードにより、次回請求額が変更されます</li>
                <li>• 変更は即座に適用され、追加機能をすぐにご利用いただけます</li>
                <li>• 次回請求日: {formatNextBillingDate()}</li>
              </>
            )}
            {isDowngrade && (
              <>
                <li>• プランダウングレードにより、次回請求額が変更されます</li>
                <li>• 変更は次回請求日から適用されます</li>
                <li>• 現在の請求期間中は現在のプランが継続されます</li>
              </>
            )}
          </ul>
        </div>

        {/* 請求情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="text-sm text-blue-900 font-bold mb-3">請求情報</div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 次回請求日: {formatNextBillingDate()}</li>
            <li>• 請求金額: ¥{selectedPlanData.price.toLocaleString()}</li>
            <li>• 決済方法: 登録済みのクレジットカード</li>
          </ul>
        </div>

        {/* 支払い方法変更の確認 */}
        {alsoChangePaymentMethod && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="text-sm text-purple-900 font-bold mb-2">支払い方法の変更</div>
            <p className="text-sm text-purple-800">
              プラン変更後、自動的に支払い方法変更画面へ移動します
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="space-y-3">
          <Button
            onClick={handleFinalConfirm}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
          >
            {isLoading ? "変更中..." : "変更する"}
          </Button>

          <Button
            onClick={() => setShowConfirmation(false)}
            variant="secondary"
            className="w-full py-3 text-base font-medium"
          >
            戻る
          </Button>
        </div>
      </div>
    )
  }

  const sortedPlans = getSortedPlans()

  // ローディング状態
  if (saitamaAppLinked === null || availablePlans.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更</h2>
          <p className="text-gray-600">プラン情報を読み込み中...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  // エラー表示
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更</h2>
          <p className="text-red-600">{fetchError}</p>
        </div>
        <Button onClick={onCancel} variant="secondary" className="w-full">
          戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">プラン変更</h2>
        <p className="text-gray-600">新しいプランを選択してください</p>
      </div>

      {/* プラン選択 */}
      <div className="space-y-4">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id
          const isSelected = selectedPlan === plan.id
          
          // さいたま市アプリ連携済みの場合の価格表示
          const isSaitamaLinked = saitamaAppLinked || linkedSaitamaAppId;
          const saitamaDiscountPrice = 480; // さいたま市アプリ連携時の価格
          
          // さいたま市アプリ連携済みで、通常価格が980円の場合
          if (isSaitamaLinked && plan.price === 980) {
            return (
              <div key={plan.id} className="relative">
                <PlanCard
                  title={plan.name}
                  description={plan.description}
                  features={plan.features}
                  price={`¥${saitamaDiscountPrice.toLocaleString()}/月`}
                  originalPrice={`¥${plan.price.toLocaleString()}/月`}
                  badge="さいたま市アプリ連携でお得"
                  isSelected={isSelected}
                  onSelect={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan}
                />

                {/* 現在のプランオーバーレイ */}
                {isCurrentPlan && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold">現在ご利用中</div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={plan.id} className="relative">
              <PlanCard
                title={plan.name}
                description={plan.description}
                features={plan.features}
                price={`¥${plan.price.toLocaleString()}/月`}
                originalPrice={plan.originalPrice}
                badge={plan.badge}
                isSelected={isSelected}
                onSelect={() => handlePlanSelect(plan.id)}
                disabled={isCurrentPlan}
              />

              {/* 現在のプランオーバーレイ */}
              {isCurrentPlan && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none">
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold">現在ご利用中</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 連携完了表示（連携済みまたは連携したIDがある場合） */}
      {(saitamaAppLinked || linkedSaitamaAppId) && (
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

      {/* さいたま市みんなのアプリ連携フォーム（未連携の場合のみ表示） */}
      {!saitamaAppLinked && !linkedSaitamaAppId && (
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
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{linkError}</p>
            </div>
          )}

          {/* ID入力フォーム */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                さいたま市みんなのアプリ ユーザーID
              </label>
              <input
                type="text"
                value={saitamaAppId}
                onChange={(e) => {
                  setSaitamaAppId(e.target.value)
                  setLinkError("")
                }}
                placeholder="ユーザーIDを入力してください"
                disabled={isLinking}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button 
              onClick={handleLinkSaitamaApp}
              disabled={isLinking || !saitamaAppId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLinking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  連携中...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  アプリと連携して500円OFFで利用する
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-600">
              ※ 連携後、すぐに割引価格が適用されます
            </p>
          </div>
        </div>
      )}

      {/* 支払い方法も変更するチェックボックス */}
      {selectedPlan && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoChangePaymentMethod}
              onChange={(e) => setAlsoChangePaymentMethod(e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-purple-900 mb-1">
                支払い方法も変更する
              </div>
              <p className="text-xs text-purple-700">
                プラン変更後、自動的にカード情報の変更画面に移動します
              </p>
            </div>
          </label>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-bold mb-2">プラン変更について</div>
            <ul className="space-y-1">
              <li>• プラン変更はいつでも可能です</li>
              <li>• アップグレードは即座に適用されます</li>
              <li>• ダウングレードは次回請求日から適用されます</li>
              <li>• 変更後のキャンセルも可能です</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedPlan}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium disabled:bg-gray-300"
        >
          変更する
        </Button>

        <Button onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>

      {/* 成功モーダル */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 連携完了"
      >
        <div className="text-center py-4">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            さいたま市みんなのアプリとの連携が完了しました！
          </h3>
          <p className="text-gray-600 mb-4 whitespace-pre-line">
            {modalMessage}
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-bold transition-colors"
          >
            プラン変更画面に戻る
          </button>
        </div>
      </Modal>
    </div>
  )
}