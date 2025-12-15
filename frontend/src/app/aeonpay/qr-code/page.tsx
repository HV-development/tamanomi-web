'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { getQrTransaction } from '@/lib/api-client'
import { getCookie, deleteCookie } from '@/lib/cookie'

/**
 * イオンペイ決済のQRコード画面
 * 
 * 重要: イオンペイの「導入補足資料」に基づく正しい処理フロー
 * 
 * 1. PCブラウザの場合:
 *    - payTransaction APIの応答で resultProperty.qrCodeUrl を取得
 *    - このURLは「イオンペイが提供するQRコード表示画面のURL」
 *    - このURLにGETでリダイレクトして、イオンペイのQRコード画面を表示
 *    - ユーザーがスマホのiAEONアプリでそのQRコードを読み取る
 * 
 * 2. スマホブラウザの場合:
 *    - 同様に qrCodeUrl にリダイレクト
 *    - イオンペイがスマホを検知し、アプリ起動画面を表示
 * 
 * 3. スマホアプリの場合:
 *    - resultProperty.application_start_key を使用
 *    - &origin=app を末尾に追加してiAEONアプリを起動
 */
function AeonPayQrCodeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [planId, setPlanId] = useState<string | null>(null)
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // URLパラメータからqrCodeUrlを取得
    const qrCodeUrlParam = searchParams.get('qrCodeUrl')
    const paymentTransactionIdParam = searchParams.get('paymentTransactionId')
    const status = searchParams.get('status')
    const transactionIdParam = searchParams.get('transactionId')
    // イオンペイからのコールバックパラメータを確認
    const tradeStatus = searchParams.get('tradeStatus')
    const tradeTransactionId = searchParams.get('transactionId')

    // paymentTransactionIdを設定
    if (paymentTransactionIdParam) {
      setPaymentTransactionId(paymentTransactionIdParam)
    }

    // transactionIdを設定（決済状態のポーリングに使用）
    if (transactionIdParam) {
      setTransactionId(transactionIdParam)
    }

    // イオンペイからのコールバック（成功/失敗/キャンセル/不明）を処理
    // 導入補足資料 2.5/3.5 に基づき、tradeStatusパラメータを確認
    if (tradeStatus) {
      setIsLoading(false)
      if (tradeStatus === 'success' || tradeStatus === 'unknown') {
        // 成功または不明の場合は、取引情報を照会して確認
        setPaymentStatus('pending')
        if (tradeTransactionId) {
          setTransactionId(tradeTransactionId)
        }
      } else if (tradeStatus === 'failure') {
        setPaymentStatus('failed')
      } else if (tradeStatus === 'cancel') {
        setPaymentStatus('failed')
        setError('決済がキャンセルされました。')
      }
      return
    }

    // status（通常のコールバック用）を確認
    if (status === 'SUCCESS') {
      setPaymentStatus('success')
      setIsLoading(false)
      return
    } else if (status === 'FAILED' || status === 'CANCEL') {
      setPaymentStatus('failed')
      setIsLoading(false)
      return
    }

    if (qrCodeUrlParam) {
      setQrCodeUrl(qrCodeUrlParam)
      setIsLoading(false)
    } else if (paymentTransactionIdParam) {
      // paymentTransactionIdがある場合は、Cookieから取得を試みる
      const storedQrCodeUrl = getCookie(`tamanomi_payment_qrCodeUrl_${paymentTransactionIdParam}`)
      const storedTransactionId = getCookie(`tamanomi_payment_transactionId_${paymentTransactionIdParam}`)
      const storedPlanId = getCookie(`tamanomi_payment_planId_${paymentTransactionIdParam}`)
      
      if (storedQrCodeUrl) {
        setQrCodeUrl(storedQrCodeUrl)
        setIsLoading(false)
      } else {
        setError('QRコード情報が見つかりませんでした。')
        setIsLoading(false)
      }

      if (storedTransactionId && !transactionIdParam) {
        setTransactionId(storedTransactionId)
      }

      if (storedPlanId) {
        setPlanId(storedPlanId)
      }
    } else {
      setError('QRコード情報が取得できませんでした。')
      setIsLoading(false)
    }

    // クリーンアップ関数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [searchParams])

  // 決済状態をポーリング
  useEffect(() => {
    if (!transactionId || paymentStatus !== 'pending') {
      return
    }

    const checkPaymentStatus = async () => {
      try {
        const { data, error: apiError } = await getQrTransaction(transactionId)

        if (apiError || !data) {
          console.error('決済状態の取得に失敗:', apiError)
          return
        }

        // 決済状態を確認
        if (data.status === 'SUCCESS') {
          setPaymentStatus('success')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          // 成功画面に遷移（少し遅延を入れてユーザーに確認してもらう）
          setTimeout(() => {
            const currentPlanId = planId || (paymentTransactionId ? getCookie(`tamanomi_payment_planId_${paymentTransactionId}`) : null)
            const successUrl = currentPlanId 
              ? `/plan-registration/success?planId=${currentPlanId}&paymentMethod=AeonPay`
              : `/plan-registration/success?paymentMethod=AeonPay`
            
            // 決済完了後、Cookieを削除
            if (paymentTransactionId) {
              deleteCookie(`tamanomi_payment_qrCodeUrl_${paymentTransactionId}`)
              deleteCookie(`tamanomi_payment_transactionId_${paymentTransactionId}`)
              deleteCookie(`tamanomi_payment_planId_${paymentTransactionId}`)
            }
            
            router.push(successUrl)
          }, 2000)
        } else if (data.status === 'FAILED') {
          setPaymentStatus('failed')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
        }
        // PROCESSING または REQUIRES_ACTION の場合は継続してポーリング
      } catch (err) {
        console.error('決済状態の確認中にエラーが発生:', err)
      }
    }

    // 初回チェック
    checkPaymentStatus()

    // 5秒ごとにポーリング
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [transactionId, paymentStatus, router, paymentTransactionId, planId])

  // イオンペイのQRコード画面にリダイレクト（自動リダイレクト用）
  // 導入補足資料7.1に基づき、qrCodeUrlにGETでリダイレクトしてイオンペイ画面を表示
  useEffect(() => {
    if (qrCodeUrl && !hasRedirected && paymentStatus === 'pending') {
      // 自動リダイレクトを実行
      setHasRedirected(true)
      // イオンペイの画面にリダイレクト（GETリクエスト）
      // イオンペイ側でQRコード画面またはスマホアプリ起動画面が表示される
      window.location.href = qrCodeUrl
    }
  }, [qrCodeUrl, hasRedirected, paymentStatus])

  const handleBack = () => {
    router.push('/plan-registration')
  }

  const handleOpenInApp = () => {
    if (qrCodeUrl) {
      // イオンペイのQRコード画面/アプリ起動画面にリダイレクト
      // 導入補足資料7.1「リダイレクト画面について」に基づく
      // GETメソッドでqrCodeUrlに遷移することで、イオンペイが提供する画面が表示される
      window.location.href = qrCodeUrl
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">QRコードを読み込み中...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">エラーが発生しました</h1>
          <p className="text-sm text-gray-600">{error}</p>
          <Button onClick={handleBack} variant="primary" className="w-auto max-w-xs mx-auto flex items-center justify-center py-3 text-base font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">決済が完了しました</h1>
          <p className="text-sm text-gray-600">プランが有効になりました。</p>
          <Button onClick={() => router.push('/plan-registration/success')} className="w-auto max-w-xs mx-auto flex items-center justify-center py-3 text-base font-medium">
            完了画面へ
          </Button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">決済に失敗しました</h1>
          <p className="text-sm text-gray-600">再度お試しいただくか、別の支払い方法をご利用ください。</p>
          <Button onClick={handleBack} variant="primary" className="w-auto max-w-xs mx-auto flex items-center justify-center py-3 text-base font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>
      </div>
    )
  }

  // イオンペイの画面にリダイレクト中の表示
  // 導入補足資料に基づき、qrCodeUrlに自動リダイレクトして
  // イオンペイが提供するQRコード画面またはアプリ起動画面を表示させる
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">イオンペイ決済画面に移動中</h1>
          <p className="text-sm text-gray-600">
            イオンペイの決済画面にリダイレクトしています。<br />
            しばらくお待ちください。
          </p>
        </div>

        {qrCodeUrl && !hasRedirected && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <p className="text-xs text-gray-500 text-center">
              自動的に画面が切り替わらない場合は下のボタンを押してください
            </p>
            <Button 
              onClick={handleOpenInApp} 
              className="w-full flex items-center justify-center py-3 text-base font-medium"
              variant="primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              イオンペイ決済画面を開く
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button onClick={handleBack} variant="secondary" className="w-full flex items-center justify-center py-3 text-base font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            キャンセルして戻る
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AeonPayQrCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">QRコードを読み込み中...</h1>
        </div>
      </div>
    }>
      <AeonPayQrCodeContent />
    </Suspense>
  )
}

