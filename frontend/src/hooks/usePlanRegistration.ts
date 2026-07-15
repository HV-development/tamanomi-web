'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type {
  PlanListResponse,
  PlanResponse,
  PaymentMethodType,
} from '@hv-development/schemas'
import { isFutureExecutedDate } from '@/utils/application-date'
import { setCookie } from '@/lib/cookie'
import {
  fetchCurrentUser,
  fetchActivePlans,
  registerCreditCard,
  requestPayPayPayment,
  requestQrPayment,
} from '@/services/plan-registration'
import type { UserData } from '@/services/plan-registration'

function generateCustomerId(emailStr: string): string {
  let hash = 0
  for (let i = 0; i < emailStr.length; i++) {
    const char = emailStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
  return `cust_${hashStr}`
}

function generateRequestId(paymentMethod?: string): string {
  const random = Math.random().toString(36).substring(2, 10)
  if (paymentMethod === 'AeonPay') {
    // イオンペイはrequestIdが20文字以内・英数字と'_'のみ（36進数9文字 + '_' + ランダム8文字 = 18文字）
    return `${Date.now().toString(36)}_${random}`
  }
  return `${Date.now()}-${random}`
}

export function usePlanRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanListResponse['plans']>([])
  const [email, setEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string>('')
  const [saitamaAppLinked, setSaitamaAppLinked] = useState<boolean | null>(null)
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false)
  const [isPaymentMethodChangeOnly, setIsPaymentMethodChangeOnly] = useState<boolean>(false)
  const [userId, setUserId] = useState<string>('')
  const router = useRouter()

  // --- ユーザー情報取得 ---
  const refreshUserInfo = useCallback(async (): Promise<UserData | null> => {
    try {
      const userData = await fetchCurrentUser()

      // 支払いが一時停止中のユーザーはプラン登録画面を使わせない
      // （新規登録ではなく支払い方法変更で再開すべきため、専用画面へリダイレクト）
      if (userData.plan?.status === 'paused') {
        router.replace('/payment-method-change')
        return userData
      }

      if (userData.email) {
        setEmail(userData.email)
      } else {
        console.error('❌ [refreshUserInfo] No email found in user data')
        setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
      }

      if (userData.id) {
        setUserId(userData.id)
      }

      setSaitamaAppLinked(userData.saitamaAppLinked === true)

      const hasCard = userData.userCards && Array.isArray(userData.userCards) && userData.userCards.length > 0
      setHasPaymentMethod(!!hasCard)

      return userData
    } catch (err) {
      console.error('❌ [refreshUserInfo] Error:', err)
      setSaitamaAppLinked(false)
      setError(err instanceof Error ? err.message : 'ユーザー情報の取得中にエラーが発生しました。')
      return null
    }
  }, [router])

  // --- プラン一覧取得 ---
  const loadPlans = useCallback(async (explicitLinkedState?: boolean | null) => {
    try {
      setIsLoading(true)
      const linkedState = explicitLinkedState !== undefined ? explicitLinkedState : saitamaAppLinked
      const data = await fetchActivePlans(linkedState)
      setPlans(data.plans)
    } catch {
      setError('プランの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [saitamaAppLinked])

  // --- 初期化: URLパラメータ解析 + ユーザー情報取得 ---
  useEffect(() => {
    setIsClient(true)
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)

    if (urlParams.get('payment-method-change') === 'true') {
      setIsPaymentMethodChangeOnly(true)
    }

    if (urlParams.get('saitamaAppLinked') === 'true') {
      setSaitamaAppLinked(true)
    }

    refreshUserInfo()
  }, [refreshUserInfo])

  // --- フォーカス復帰時にメール再取得 ---
  useEffect(() => {
    const handleFocus = () => {
      if (!email) {
        refreshUserInfo()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [email, refreshUserInfo])

  // --- saitamaAppLinked 未確定時にユーザー情報取得 ---
  useEffect(() => {
    if (isClient && saitamaAppLinked === null) {
      refreshUserInfo()
    }
  }, [isClient, saitamaAppLinked, refreshUserInfo])

  // --- saitamaAppLinked 確定後にプラン一覧取得 ---
  useEffect(() => {
    if (isClient && saitamaAppLinked !== null) {
      loadPlans()
    }
  }, [isClient, saitamaAppLinked, loadPlans])

  // --- 金額算出 ---
  const calcPaymentAmount = (plan: PlanResponse): number => {
    const isLinked = saitamaAppLinked === true
    const discountPrice = plan.discount_price ?? null
    const rawAmount = isLinked && discountPrice != null ? discountPrice : plan.price
    return Number(rawAmount)
  }

  // --- 確認ダイアログ ---
  const confirmPayment = (
    plan: PlanResponse & { first_executed_date?: string | null },
    paymentAmount: number,
    paymentMethod: PaymentMethodType,
  ): boolean => {
    const isFutureDate = isFutureExecutedDate(plan.first_executed_date)

    let confirmMessage: string
    if (paymentMethod === 'CreditCard') {
      confirmMessage = isFutureDate
        ? 'カード登録を行います。よろしいですか？'
        : 'カード登録と同時に初回決済を行います。よろしいですか？'
    } else if (paymentMethod === 'AeonPay') {
      confirmMessage = 'イオンペイで決済を行います。よろしいですか？'
    } else {
      confirmMessage = 'PayPayで決済を行います。よろしいですか？'
    }

    return window.confirm(
      `プラン「${plan.name}」\n` +
      `決済金額: ¥${paymentAmount.toLocaleString()}\n\n` +
      confirmMessage,
    )
  }

  // --- AeonPay決済 ---
  const processAeonPay = async (currentUserId: string, planId: string, paymentAmount: number) => {
    const requestId = generateRequestId('AeonPay')
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { data, error: apiError } = await requestQrPayment({
      userId: currentUserId,
      paymentMethodId: 'AeonPay',
      requestId,
      amount: { currencyCode: 'JPY', value: paymentAmount },
      requestProperty: {
        successUrl: `${origin}/aeonpay/qr-code`,
        failureUrl: `${origin}/aeonpay/qr-code`,
        cancelUrl: `${origin}/aeonpay/qr-code`,
      },
      metadata: { planId },
      captureNow: true,
    })

    if (apiError || !data) {
      throw new Error(apiError?.message || 'イオンペイ決済の申込に失敗しました')
    }

    if (data.status === 'FAILED') {
      const desc = data.resultDescription || 'イオンペイ決済の申込に失敗しました'
      throw new Error(desc)
    }

    const qrCodeUrl = (data.resultProperty as Record<string, unknown> | null)?.qrCodeUrl as string | undefined
    const transactionId = data.transactionId

    if (data.paymentTransactionId) {
      if (qrCodeUrl) {
        setCookie(`tamanomi_payment_qrCodeUrl_${data.paymentTransactionId}`, qrCodeUrl, { maxAge: 600 })
      }
      if (transactionId) {
        setCookie(`tamanomi_payment_transactionId_${data.paymentTransactionId}`, transactionId, { maxAge: 600 })
      }
      if (planId) {
        setCookie(`tamanomi_payment_planId_${data.paymentTransactionId}`, planId, { maxAge: 600 })
      }
    }

    const redirectParams = new URLSearchParams()
    if (data.paymentTransactionId) redirectParams.set('paymentTransactionId', data.paymentTransactionId)
    if (qrCodeUrl) redirectParams.set('qrCodeUrl', qrCodeUrl)
    if (transactionId) redirectParams.set('transactionId', transactionId)

    router.push(`/aeonpay/qr-code?${redirectParams.toString()}`)
  }

  // --- PayPay決済 ---
  const processPayPay = async (currentUserId: string, planId: string, paymentAmount: number) => {
    const requestId = generateRequestId()
    const { data, error: apiError } = await requestPayPayPayment({
      userId: currentUserId,
      requestId,
      amount: { currencyCode: 'JPY', value: paymentAmount },
      requestProperty: { planId },
      metadata: { planId },
    })

    if (apiError || !data) {
      throw new Error(apiError?.message || 'PayPay決済の申込に失敗しました')
    }

    if (data.redirectHtml) {
      setCookie('tamanomi_payment_paypayHtml', encodeURIComponent(data.redirectHtml), { maxAge: 600 })
    }

    router.push('/paypay/checkout')
  }

  // --- クレジットカード登録 ---
  const processCreditCard = async (
    currentEmail: string,
    planId: string | undefined,
  ) => {
    const customerId = generateCustomerId(currentEmail)
    const data = await registerCreditCard({
      customerId,
      userEmail: currentEmail,
      planId,
    })

    const { redirectUrl, params } = data

    if (redirectUrl.includes('/payment-mock')) {
      const url = new URL(redirectUrl)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value))
      })
      window.location.href = url.toString()
    } else {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = redirectUrl
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    }
  }

  // --- メインハンドラ ---
  const handlePaymentMethodRegister = async (planId: string, paymentMethod: PaymentMethodType) => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError('')

      const isChangeOnly = !planId || planId === ''

      if (isChangeOnly && paymentMethod !== 'CreditCard') {
        setError('支払い方法の変更はクレジットカードのみ対応しています')
        setIsLoading(false)
        return
      }

      let paymentAmount = 0

      if (!isChangeOnly) {
        const selectedPlan = plans.find(p => p.id === planId)
        if (!selectedPlan) {
          setError('選択したプランが見つかりません。ページを再読み込みしてください。')
          setIsLoading(false)
          return
        }

        const planWithDate = selectedPlan as PlanResponse & { first_executed_date?: string | null }
        paymentAmount = calcPaymentAmount(selectedPlan)

        if (paymentAmount <= 0) {
          setError('決済金額が正しくありません。プランをご確認ください。')
          setIsLoading(false)
          return
        }

        if (!confirmPayment(planWithDate, paymentAmount, paymentMethod)) {
          setIsLoading(false)
          return
        }
      }

      let currentEmail = email?.trim() ?? ''
      let currentUserId = userId

      if (!currentEmail || !currentUserId) {
        const userData = await refreshUserInfo()
        if (!currentEmail) currentEmail = userData?.email?.trim() || email?.trim() || ''
        if (!currentUserId) currentUserId = userData?.id || userId
      }

      if (!currentEmail) {
        setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        setIsLoading(false)
        return
      }

      if (paymentMethod === 'AeonPay' || paymentMethod === 'PayPay') {
        if (!currentUserId) {
          setError('ユーザー情報が取得できません。再度ログインしてください。')
          setIsLoading(false)
          return
        }

        if (paymentMethod === 'AeonPay') {
          await processAeonPay(currentUserId, planId, paymentAmount)
        } else {
          await processPayPay(currentUserId, planId, paymentAmount)
        }
      } else {
        await processCreditCard(currentEmail, isChangeOnly ? undefined : planId)
      }
    } catch (err) {
      console.error('▲ERROR [handlePaymentMethodRegister]:', err)
      setError(err instanceof Error ? err.message : 'プランの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // --- さいたま市アプリ連携ハンドラ ---
  const handleSaitamaAppLinked = async () => {
    try {
      const userData = await fetchCurrentUser()
      const newLinkedState = userData.saitamaAppLinked === true
      setSaitamaAppLinked(newLinkedState)
      await loadPlans(newLinkedState)
    } catch {
      // 連携確認失敗は静かに無視
    }
  }

  // --- キャンセルハンドラ ---
  const handleCancel = () => {
    setEmail('')
    setError('')
    setSaitamaAppLinked(null)
    setHasPaymentMethod(false)
    setIsPaymentMethodChangeOnly(false)
    router.push('/')
  }

  const handleLogoClick = () => router.push('/')

  return {
    isClient,
    isLoading,
    plans,
    error,
    saitamaAppLinked,
    hasPaymentMethod,
    isPaymentMethodChangeOnly,
    handlePaymentMethodRegister,
    handleSaitamaAppLinked,
    handleCancel,
    handleLogoClick,
  }
}
