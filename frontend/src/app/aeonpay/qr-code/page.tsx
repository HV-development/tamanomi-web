'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { Loader2, ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { getQrTransaction } from '@/lib/api-client'

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // URLパラメータからqrCodeUrlを取得
    const qrCodeUrlParam = searchParams.get('qrCodeUrl')
    const paymentTransactionIdParam = searchParams.get('paymentTransactionId')
    const status = searchParams.get('status')
    const transactionIdParam = searchParams.get('transactionId')

    // paymentTransactionIdを設定
    if (paymentTransactionIdParam) {
      setPaymentTransactionId(paymentTransactionIdParam)
    }

    // transactionIdを設定（決済状態のポーリングに使用）
    if (transactionIdParam) {
      setTransactionId(transactionIdParam)
    }

    if (qrCodeUrlParam) {
      setQrCodeUrl(qrCodeUrlParam)
      setIsLoading(false)
    } else if (paymentTransactionIdParam) {
      // paymentTransactionIdがある場合は、セッションストレージから取得を試みる
      const storedQrCodeUrl = sessionStorage.getItem(`qrCodeUrl_${paymentTransactionIdParam}`)
      const storedTransactionId = sessionStorage.getItem(`transactionId_${paymentTransactionIdParam}`)
      const storedPlanId = sessionStorage.getItem(`planId_${paymentTransactionIdParam}`)
      
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

    // ステータスを設定
    if (status === 'SUCCESS') {
      setPaymentStatus('success')
    } else if (status === 'FAILED') {
      setPaymentStatus('failed')
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
            const currentPlanId = planId || (typeof window !== 'undefined' && paymentTransactionId ? sessionStorage.getItem(`planId_${paymentTransactionId}`) : null)
            const successUrl = currentPlanId 
              ? `/plan-registration/success?planId=${currentPlanId}&paymentMethod=AeonPay`
              : `/plan-registration/success?paymentMethod=AeonPay`
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

  const handleBack = () => {
    router.push('/plan-registration')
  }

  const handleOpenInApp = () => {
    if (qrCodeUrl) {
      // 同じタブで開く（セッションストレージを共有するため）
      // QRコードを読み取る場合と同様に、同じタブで遷移することで
      // イオンペイアプリから戻ってきた時にセッションストレージが利用可能になる
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">イオンペイ決済</h1>
          <p className="text-sm text-gray-600">
            下記のQRコードをイオンペイアプリで読み取ってください
          </p>
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
              <QRCode
                value={qrCodeUrl}
                size={256}
                level="M"
                className="w-full h-full"
              />
            </div>
            <Button 
              onClick={handleOpenInApp} 
              className="w-full flex items-center justify-center py-3 text-base font-medium"
              variant="primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              アプリを起動する
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button onClick={handleBack} variant="primary" className="w-full flex items-center justify-center py-3 text-base font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
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

