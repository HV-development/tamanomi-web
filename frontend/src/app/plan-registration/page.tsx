'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRegistrationContainer } from '@/components/organisms/PlanRegistrationContainer'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import type { PaymentMethodType } from '@/types/payment'
import { requestPayPayPayment, requestQrPayment } from '@/lib/api-client'
import {
  PlanListResponse,
  PlanListResponseSchema
} from '@hv-development/schemas'
import type { PayPayPaymentRequest } from '@hv-development/schemas'
import { getRegisterSessionItem, removeRegisterSessionItem } from '@/lib/register-session'

export default function PlanRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanListResponse['plans']>([])
  const [email, setEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string>('')
  const [saitamaAppLinked, setSaitamaAppLinked] = useState<boolean | null>(null)
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false)
  const [isPaymentMethodChangeOnly, setIsPaymentMethodChangeOnly] = useState<boolean>(false)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [confirmModalData, setConfirmModalData] = useState<{
    planName: string
    paymentAmount: number
    paymentMethodLabel: string
    actionDescription: string
    planId: string
    paymentMethod: PaymentMethodType
  } | null>(null)
  const router = useRouter()

  const fetchUserInfo = useCallback(async () => {
    try {
      // Cookieベースの認証のみを使用（localStorageは廃止）
      // credentials: 'include'でCookieから自動的に認証される
      const response = await fetch('/api/user/me', {
        cache: 'no-store',
        credentials: 'include', // Cookieを送信
      })


      if (response.ok) {
        const userData = await response.json()

        if (userData.id) {
          setUserId(userData.id)
          sessionStorage.setItem('userId', userData.id)
        }

        // メールアドレスをユーザーデータから取得（常に更新）
        if (userData.email) {
          setEmail(userData.email)
          sessionStorage.setItem('userEmail', userData.email)
        } else {
          console.error('❌ [fetchUserInfo] No email found in user data')
          setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        }

        const newLinkedState = userData.saitamaAppLinked === true
        setSaitamaAppLinked(newLinkedState)

        // カード登録状態を確認（sessionStorageにpaygentCustomerCardIdがあれば登録済み）
        const hasCard = !!sessionStorage.getItem('paygentCustomerCardId')
        setHasPaymentMethod(hasCard)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [fetchUserInfo] API error:', response.status, errorData)
        setSaitamaAppLinked(false)

        // 認証失敗時（401/403）はログイン画面にリダイレクト
        if (response.status === 401 || response.status === 403) {
          router.push('/login?redirect=/plan-registration')
          return
        }

        if (response.status === 404) {
          setError('ユーザー情報が見つかりません。新規登録画面からやり直してください。')
        } else {
          setError('ユーザー情報の取得に失敗しました。再度お試しください。')
        }
      }
    } catch (error) {
      console.error('❌ [fetchUserInfo] Error:', error)
      setSaitamaAppLinked(false)
      setError('ユーザー情報の取得中にエラーが発生しました。')
    }
  }, [router])

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    const initializePage = async () => {
      if (typeof window === 'undefined') return

      const urlParams = new URLSearchParams(window.location.search)
      const saitamaAppLinkedParam = urlParams.get('saitamaAppLinked')
      const refreshParam = urlParams.get('refresh')
      const paymentMethodChangeParam = urlParams.get('payment-method-change')

      // サーバーサイドセッションからメールアドレスを取得（登録フローからの遷移用）
      // セキュリティ改善：sessionStorageの代わりにhttpOnly Cookieベースのセッションを使用
      const serverSessionEmail = await getRegisterSessionItem<string>('userEmail')
      if (serverSessionEmail) {
        setEmail(serverSessionEmail)
        // 使用後にサーバーサイドセッションからクリア
        await removeRegisterSessionItem('userEmail')
      }

      // 支払い方法変更のみの場合はフラグを設定
      if (paymentMethodChangeParam === 'true') {
        setIsPaymentMethodChangeOnly(true)
      }

      // URLパラメータでsaitamaAppLinked=trueが指定されている場合（ポイント付与後）
      if (saitamaAppLinkedParam === 'true') {
        setSaitamaAppLinked(true)
      }

      // refreshパラメータがある場合、ユーザー情報を再取得（ガイドページからの戻り）
      if (refreshParam) {
        fetchUserInfo()
      } else {
        // 常にユーザー情報を取得してメールアドレスを確実に取得する
        // （APIから取得した方が確実）
        fetchUserInfo()
      }
    }
    initializePage()
  }, [fetchUserInfo])

  // ページがフォーカスされた時にユーザー情報を再取得（戻るボタンで戻ってきた時など）
  useEffect(() => {
    const handleFocus = () => {
      // メールアドレスが設定されていない場合のみ再取得
      if (!email) {
        fetchUserInfo()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [email, fetchUserInfo])

  const fetchPlans = useCallback(async (explicitLinkedState?: boolean | null) => {
    try {
      setIsLoading(true)

      // 明示的に渡された状態を優先、なければ現在の状態を使用
      const linkedState = explicitLinkedState !== undefined ? explicitLinkedState : saitamaAppLinked

      // さいたま市アプリ連携状態に応じてクエリパラメータを構築
      const queryParams = new URLSearchParams({
        status: 'active',
        limit: '50',
      })

      if (linkedState !== null) {
        queryParams.append('saitamaAppLinked', String(linkedState))
      }

      const apiUrl = `/api/plans?${queryParams.toString()}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // バリデーションを有効化（safeParseでエラー詳細を確認）
      const validationResult = PlanListResponseSchema.safeParse(data)

      if (!validationResult.success) {
        console.error('❌ [fetchPlans] バリデーションエラー:', validationResult.error)
        console.error('❌ [fetchPlans] エラー詳細:', validationResult.error.errors)
        throw new Error('プランのバリデーションに失敗しました')
      }

      const validatedData = validationResult.data

      setPlans(validatedData.plans)
    } catch {
      setError('プランの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [saitamaAppLinked])

  // ユーザー情報を取得してさいたま市アプリ連携状態を確認
  useEffect(() => {
    if (isClient && saitamaAppLinked === null) {
      // URLパラメータでsaitamaAppLinkedが設定されていない場合のみ取得
      fetchUserInfo()
    }
  }, [isClient, saitamaAppLinked, fetchUserInfo])

  // プラン一覧を取得（連携状態が確定した後）
  useEffect(() => {
    if (isClient && saitamaAppLinked !== null) {
      fetchPlans()
    }
  }, [isClient, saitamaAppLinked, fetchPlans])

  // ログイン後のリダイレクトフラグをチェック
  const [isLoginRedirecting, setIsLoginRedirecting] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginRedirecting = sessionStorage.getItem('loginRedirecting')
      setIsLoginRedirecting(loginRedirecting === '/plan-registration' || loginRedirecting?.startsWith('/plan-registration') || false)
    }
  }, [])

  // ログイン後のリダイレクトフラグをクリア（ページが完全に表示されたら）
  useEffect(() => {
    if (isClient && saitamaAppLinked !== null && plans.length > 0 && typeof window !== 'undefined') {
      const loginRedirecting = sessionStorage.getItem('loginRedirecting')
      if (loginRedirecting === '/plan-registration' || loginRedirecting?.startsWith('/plan-registration')) {
        // レンダリングが完了するのを待つため、次のフレームでフラグをクリア
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            sessionStorage.removeItem('loginRedirecting')
            setIsLoginRedirecting(false)
          })
        })
      }
    }
  }, [isClient, saitamaAppLinked, plans.length])

  const executePaymentMethodRegister = async (planId: string, paymentMethod: PaymentMethodType = 'CreditCard') => {
    try {
      setIsLoading(true)
      setError('')

      const getEmailFromSession = () => {
        const storedEmail = sessionStorage.getItem('userEmail')
        return storedEmail ? storedEmail.trim() : ''
      }

      let currentEmail = email?.trim() ?? ''
      if (!currentEmail) {
        currentEmail = getEmailFromSession()
      }

      // メールアドレスの検証
      if (!currentEmail) {
        await fetchUserInfo()
        currentEmail = getEmailFromSession() || email?.trim() || ''
      }

      if (!currentEmail) {
        setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        setIsLoading(false)
        return
      }

      sessionStorage.setItem('userEmail', currentEmail)

      // 支払い方法ごとの分岐

      if (paymentMethod === 'AeonPay') {
        if (!planId) {
          setError('イオンペイ決済ではプランを選択してください。')
          setIsLoading(false)
          return
        }

        if (!userId) {
          const storedUserId = sessionStorage.getItem('userId') || ''
          if (storedUserId) {
            setUserId(storedUserId)
          } else {
            setError('ユーザー情報が取得できませんでした。ログインし直してからお試しください。')
            setIsLoading(false)
            return
          }
        }

        const selectedPlan = plans.find((p) => p.id === planId)
        if (!selectedPlan) {
          setError('選択されたプランが見つかりません。')
          setIsLoading(false)
          return
        }

        const isLinked = saitamaAppLinked === true
        const discountPrice = (selectedPlan as any).discount_price ?? null

        const rawAmount = isLinked && discountPrice != null ? discountPrice : selectedPlan.price
        const paymentAmount = Number(rawAmount)

        // イオンペイのrequestIdは20文字以内の制約がある
        const requestId = `aeon_${Date.now()}`.substring(0, 20)

        // planIdをセッションストレージに保存（URLを短くするため）
        // I002エラー（successUrlが1000文字以上）を防ぐため、planIdをURLパラメータから削除
        sessionStorage.setItem(`planId_${requestId}`, planId)

        // イオンペイ固有のURLを設定（決済完了後のリダイレクト先）
        // PDF「導入補足資料（イオンペイ）」3.4.API一覧に基づき、PCブラウザ/スマホブラウザではスネークケースを使用
        // URLを短くするため、planIdはURLパラメータに含めず、セッションストレージから取得する
        // I002エラー（successUrlが1000文字以上）を防ぐため、URLを可能な限り短くする
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const successUrl = `${baseUrl}/aeonpay/qr-code?status=SUCCESS&paymentTransactionId=${requestId}`
        const failureUrl = `${baseUrl}/aeonpay/qr-code?status=FAILED&paymentTransactionId=${requestId}`
        const cancelUrl = `${baseUrl}/aeonpay/qr-code?status=CANCEL&paymentTransactionId=${requestId}`

        // イオンペイ固有のrequestPropertyを設定
        // 注意: イオンペイはPayPayと仕様が異なるため、イオンペイ固有の形式を使用
        // PDF「導入補足資料（イオンペイ）」3.4.API一覧に基づき、PCブラウザ/スマホブラウザでは以下が必須:
        // - success_url (成功時URL)
        // - failure_url (失敗時URL)
        // - cancel_url (キャンセル時URL)
        const qrPaymentRequest = {
          userId: userId || sessionStorage.getItem('userId') || '',
          paymentMethodId: 'AeonPay' as const,
          requestId,
          amount: {
            currencyCode: 'JPY' as const,
            value: paymentAmount,
          },
          requestProperty: {
            // イオンペイ固有の必須フィールド
            // APIドキュメントによると、フィールド名はcamelCase形式（successUrl, failureUrl, cancelUrl）を使用します
            // PDF「導入補足資料（イオンペイ）」ではsnake_case（success_url）と記載されていますが、
            // APIドキュメントではcamelCase（successUrl）が正しい形式です
            // エラーコード一覧ドキュメントによると、以下が必須で1000桁以下に制限されています
            successUrl: successUrl, // 決済完了後のリダイレクト先URL（必須、1000桁以下）
            failureUrl: failureUrl, // 決済失敗時のリダイレクト先URL（必須、1000桁以下）
            cancelUrl: cancelUrl, // 決済キャンセル時のリダイレクト先URL（必須、1000桁以下）
            // 注意: orderNumberとdescriptionはイオンペイAPIではサポートされていない可能性があります
            // エラーコードI002が発生するため、これらを削除して必須フィールドのみを送信します
          },
          metadata: {
            planId,
            planName: selectedPlan.name,
          },
        }

        // イオンペイ決済申込API呼び出し
        const { data, error } = await requestQrPayment(qrPaymentRequest)

        if (error || !data) {
          setError(error?.message || 'イオンペイ決済の申込に失敗しました')
          setIsLoading(false)
          return
        }

        // イオンペイ決済の結果を確認
        if (data.status === 'SUCCESS') {
          // 決済成功時はプラン登録完了画面に遷移
          router.push(`/plan-registration/success?planId=${planId}&paymentMethod=AeonPay`)
        } else if (data.status === 'PROCESSING' || data.status === 'REQUIRES_ACTION') {
          // QRコード表示が必要な場合（resultProperty.qrCodeUrlが存在する場合）
          const qrCodeUrl = data.resultProperty?.qrCodeUrl as string | undefined
          const transactionId = data.transactionId

          if (qrCodeUrl) {
            // QRコードURLとtransactionIdをセッションストレージに保存
            if (typeof window !== 'undefined' && data.paymentTransactionId) {
              sessionStorage.setItem(`qrCodeUrl_${data.paymentTransactionId}`, qrCodeUrl)
              if (transactionId) {
                sessionStorage.setItem(`transactionId_${data.paymentTransactionId}`, transactionId)
              }
            }

            // QRコード画面に遷移（transactionIdも渡す）
            const queryParams = new URLSearchParams({
              qrCodeUrl,
              paymentTransactionId: data.paymentTransactionId || requestId,
            })
            if (transactionId) {
              queryParams.set('transactionId', transactionId)
            }
            router.push(`/aeonpay/qr-code?${queryParams.toString()}`)
          } else {
            setError('QRコード情報が取得できませんでした。')
            setIsLoading(false)
          }
        } else {
          setError(data.resultDescription || 'イオンペイ決済に失敗しました')
          setIsLoading(false)
          return
        }

        setIsLoading(false)
        return
      }

      if (paymentMethod === 'PayPay') {
        if (!planId) {
          setError('PayPay決済ではプランを選択してください。')
          setIsLoading(false)
          return
        }

        if (!userId) {
          const storedUserId = sessionStorage.getItem('userId') || ''
          if (storedUserId) {
            setUserId(storedUserId)
          } else {
            setError('ユーザー情報が取得できませんでした。ログインし直してからお試しください。')
            setIsLoading(false)
            return
          }
        }

        const selectedPlan = plans.find((p) => p.id === planId)
        if (!selectedPlan) {
          setError('選択されたプランが見つかりません。')
          setIsLoading(false)
          return
        }

        const isLinked = saitamaAppLinked === true
        const discountPrice = (selectedPlan as any).discount_price ?? null

        const rawAmount = isLinked && discountPrice != null ? discountPrice : selectedPlan.price
        const paymentAmount = Number(rawAmount)

        const payPayRequest: PayPayPaymentRequest = {
          userId: userId || sessionStorage.getItem('userId') || '',
          // 現時点ではショップIDは未使用のため省略
          requestId: `${Date.now()}`,  // PayPay APIは数値のみを期待するため、プレフィックスなし
          amount: {
            currencyCode: 'JPY',
            value: paymentAmount,
          },
          requestProperty: {
            planId,
            planName: selectedPlan.name,
          },
          metadata: {
            planId,
          },
        }

        // PayPay決済申込API呼び出し
        const { data, error } = await requestPayPayPayment(payPayRequest)

        if (error || !data) {
          setError(error?.message || 'PayPay決済の申込に失敗しました')
          setIsLoading(false)
          return
        }

        // 決済ステータスに応じた処理
        if (data.status === 'SUCCESS') {
          // 決済成功時はプラン登録完了画面に遷移
          router.push(`/plan-registration/success?planId=${planId}&paymentMethod=PayPay`)
          setIsLoading(false)
          return
        } else if (data.status === 'PROCESSING' || data.status === 'REQUIRES_ACTION') {
          // QRコード表示が必要な場合（redirectHtmlが存在する場合）
          if (data.redirectHtml) {
            // redirectHtml をセッションに保存し、チェックアウト画面へ遷移
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('paypayRedirectHtml', data.redirectHtml)
              const query = new URLSearchParams({
                redirectHtml: encodeURIComponent(data.redirectHtml),
              })
              router.push(`/paypay/checkout?${query.toString()}`)
            }
          } else {
            // redirectHtmlが存在しない場合は、取引IDを使って完了画面に遷移
            if (data.transactionId) {
              router.push(`/paypay/complete?payment_id=${data.transactionId}`)
            } else {
              setError('PayPayの支払い画面情報の取得に失敗しました')
              setIsLoading(false)
              return
            }
          }
        } else {
          // 決済失敗
          setError(data.resultDescription || 'PayPay決済に失敗しました')
          setIsLoading(false)
          return
        }

        setIsLoading(false)
        return
      }

      // クレジットカード: カード登録APIを呼び出し
      // customerId: メールアドレスのハッシュ値を使用して25文字以内に収める
      const generateCustomerId = (email: string): string => {
        // メールアドレスのハッシュ値を生成（簡易版）
        let hash = 0
        for (let i = 0; i < email.length; i++) {
          const char = email.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        // 絶対値を取得して16進数に変換（最大8文字）
        const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
        // "cust_" + ハッシュ値 = 最大13文字
        return `cust_${hashStr}`
      }

      const customerId = generateCustomerId(currentEmail)

      // 支払い方法変更のみの場合はplanIdを送信しない
      const requestBody: Record<string, string> = {
        customerId: customerId,
        userEmail: currentEmail, // セッション管理用
      }

      if (!isPaymentMethodChangeOnly) {
        requestBody.planId = planId // セッション管理用（これがPaymentSessionに保存される）
      }

      const response = await fetch('/api/payment/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'カード登録の準備に失敗しました')
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('▲[fetch] response.json()エラー:', jsonError)
        throw jsonError
      }

      // ペイジェントのカード登録画面にリダイレクト
      // リンクタイプ方式では、redirectUrlにGETパラメータを付与してリダイレクト
      const { redirectUrl, params } = data

      // プラン登録成功後、セッションストレージからメールアドレスをクリア
      sessionStorage.removeItem('userEmail')
      // モック環境の場合はGETパラメータとしてリダイレクト
      if (redirectUrl.includes('/payment-mock')) {
        const url = new URL(redirectUrl)
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, String(value))
        })
        window.location.href = url.toString()
      } else {
        // 実際のペイジェント環境ではPOSTフォームでリダイレクト
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = redirectUrl

        // ★3 POSTフォームに追加されるパラメータをログ出力
        const formParams: Record<string, string> = {}
        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(value)
          formParams[key] = String(value)
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      }
    } catch (error) {
      console.error('▲ERROR [handlePaymentMethodRegister] エラー発生:', error)
      console.error('▲ERROR [handlePaymentMethodRegister] エラー詳細:', {
        errorType: typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      })
      setError(error instanceof Error ? error.message : 'プランの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaitamaAppLinked = async () => {
    try {
      // Cookieベースの認証のみを使用（localStorageは廃止）
      const response = await fetch('/api/user/me', {
        cache: 'no-store',
        credentials: 'include', // Cookieを送信
      })

      if (response.ok) {
        const userData = await response.json()
        const newLinkedState = userData.saitamaAppLinked === true

        // 状態を更新
        setSaitamaAppLinked(newLinkedState)

        // 状態更新を待たずに、明示的に新しい状態でプランを再取得
        await fetchPlans(newLinkedState)
      }
    } catch {
      // エラー処理
    }
  }

  const handleCancel = () => {
    // 状態をリセット
    setEmail('')
    setError('')
    setSaitamaAppLinked(null)
    setHasPaymentMethod(false)
    setIsPaymentMethodChangeOnly(false)

    // トップページに遷移
    router.push('/')
  }
  const handleLogoClick = () => router.push('/')

  const handlePaymentMethodRegister = async (planId: string, paymentMethod: PaymentMethodType = 'CreditCard') => {
    const isPaymentMethodChangeOnly = !planId || planId === ""

    // プラン選択時は確認モーダルを表示
    if (!isPaymentMethodChangeOnly) {
      const selectedPlan = plans.find((p) => p.id === planId)
      if (selectedPlan) {
        const isLinked = saitamaAppLinked === true
        const discountPrice = (selectedPlan as any).discount_price ?? null

        const rawAmount = isLinked && discountPrice != null ? discountPrice : selectedPlan.price
        const paymentAmount = Number(rawAmount)

        const paymentMethodLabel =
          paymentMethod === 'PayPay'
            ? 'PayPay（QRコード決済）'
            : paymentMethod === 'AeonPay'
              ? 'イオンペイ（QRコード決済）'
              : 'クレジットカード'

        // サブスクリプションプランかどうかで表示メッセージを切り替え
        const isSubscriptionPlan = selectedPlan.is_subscription
        let actionDescription = ''

        if (isSubscriptionPlan) {
          // サブスクリプションプランの場合
          actionDescription =
            paymentMethod === 'PayPay'
              ? '選択したプランの初回決済を、PayPayアプリで行います。'
              : paymentMethod === 'AeonPay'
                ? '選択したプランの初回決済を、イオンペイで行います。'
                : 'カード登録と同時に初回決済を行います。'
        } else {
          // 非サブスクリプションプランの場合
          actionDescription =
            paymentMethod === 'PayPay'
              ? 'PayPayで決済を実行します'
              : paymentMethod === 'AeonPay'
                ? 'イオンペイで決済を実行します'
                : 'クレジットカードで決済を実行します'
        }

        // 確認モーダルを表示
        setConfirmModalData({
          planName: selectedPlan.name,
          paymentAmount,
          paymentMethodLabel,
          actionDescription,
          planId,
          paymentMethod,
        })
        setShowConfirmModal(true)
        return
      }
    }

    // プラン選択なしの場合は直接実行
    await executePaymentMethodRegister(planId, paymentMethod)
  }

  const handleConfirmModalConfirm = async () => {
    if (confirmModalData) {
      setShowConfirmModal(false)
      await executePaymentMethodRegister(confirmModalData.planId, confirmModalData.paymentMethod)
      setConfirmModalData(null)
    }
  }

  const handleConfirmModalCancel = () => {
    setShowConfirmModal(false)
    setConfirmModalData(null)
  }

  // クライアントサイドでの初期化が完了するまで、またはログイン後のリダイレクト中はローディング表示
  if (!isClient || isLoginRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PlanRegistrationContainer
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
        onPaymentMethodRegister={handlePaymentMethodRegister}
        onLogoClick={handleLogoClick}
        onCancel={handleCancel}
        isLoading={isLoading}
        plans={plans}
        error={error}
        saitamaAppLinked={saitamaAppLinked || false}
        onSaitamaAppLinked={handleSaitamaAppLinked}
        hasPaymentMethod={hasPaymentMethod}
        isPaymentMethodChangeOnly={isPaymentMethodChangeOnly}
      />
      {confirmModalData && (
        <Modal
          isOpen={showConfirmModal}
          onClose={handleConfirmModalCancel}
          title="決済確認"
          showCloseButton={true}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">プラン:</span> {confirmModalData.planName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">決済金額:</span> ¥{confirmModalData.paymentAmount.toLocaleString()}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">支払い方法:</span> {confirmModalData.paymentMethodLabel}
              </p>
            </div>
            <p className="text-gray-800 font-medium">
              {confirmModalData.actionDescription}
            </p>
            <div className="flex flex-col gap-3 pt-6">
              <Button
                onClick={handleConfirmModalConfirm}
                className="w-full py-4"
              >
                はい
              </Button>
              <Button
                onClick={handleConfirmModalCancel}
                variant="secondary"
                className="w-full py-3"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}