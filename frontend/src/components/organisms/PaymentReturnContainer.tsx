"use client"

import { useRouter } from 'next/navigation'
import type { CampaignInfo } from '@/hooks/usePaymentReturn'

interface PaymentReturnContainerProps {
  isProcessing: boolean
  error: string | null
  isPaymentMethodChangeOnly: boolean
  campaignInfo?: CampaignInfo | null
}

function formatJstDate(iso: string): string {
  const d = new Date(iso)
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000 - d.getTimezoneOffset() * 60 * 1000)
  return `${jst.getUTCFullYear()}/${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`
}

function computeFreePeriodEnd(firstBillingDateIso: string): string {
  const d = new Date(firstBillingDateIso)
  d.setUTCDate(d.getUTCDate() - 1)
  return formatJstDate(d.toISOString())
}

export function PaymentReturnContainer({
  isProcessing,
  error,
  isPaymentMethodChangeOnly,
  campaignInfo,
}: PaymentReturnContainerProps) {
  const router = useRouter()

  if (error) {
    const isUserNotFoundError = error.includes('アカウント登録が完了していない可能性があります')

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{error}</p>

            {isUserNotFoundError ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  アカウント登録を完了してからカード登録を行ってください。
                </p>
                <button
                  onClick={() => window.location.href = '/email-registration'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  新規登録画面へ
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                トップページに戻る
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!isProcessing && campaignInfo) {
    const freePeriodEnd = computeFreePeriodEnd(campaignInfo.firstBillingDate)
    const firstBilling = formatJstDate(campaignInfo.firstBillingDate)

    return (
      <div className="min-h-screen bg-[#eefbf1] flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.25)] max-w-md w-full p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-[50px] w-[50px] rounded-full bg-[#049a2a] flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-[22px] font-semibold text-black">カード登録完了</h2>

          <div className="text-center text-sm text-[#3c4656] leading-[1.8]">
            <p>ご登録ありがとうございます。</p>
            <p>キャンペーンが適用されました。</p>
          </div>

          <div className="rounded-lg border border-[rgba(4,154,42,0.24)] bg-[#f0fdf4] px-4 py-6 space-y-4">
            <p className="text-center text-xs font-bold text-[#33803f]">
              最初の{campaignInfo.freeDaysApplied}日間無料 でご利用いただけます！
            </p>
            <div className="rounded-lg border border-[#d9d9d9] bg-white px-4 py-2">
              <div className="flex items-center justify-between border-b border-[#d9d9d9] py-2">
                <span className="text-xs text-[#757575]">無料期間</span>
                <span className="flex items-center gap-1 text-xs font-bold text-[#33803f]">
                  <span>本日</span>
                  <span>〜</span>
                  <span>{freePeriodEnd}</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-[#757575]">初回決済日</span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="font-medium text-black">{firstBilling}</span>
                  <span className="font-bold text-[#757575]">(¥{campaignInfo.planPrice.toLocaleString()})</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/home?payment-success=true')}
            className="w-full rounded-2xl bg-[#049a2a] py-4 text-sm font-semibold text-white"
          >
            HOME画面へ進む
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          {isProcessing ? (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isPaymentMethodChangeOnly ? '支払い方法変更を処理中...' : 'カード登録を処理中...'}
              </h2>
              <p className="text-gray-600">
                {isPaymentMethodChangeOnly
                  ? 'カード情報の変更を処理しています。\nしばらくお待ちください。'
                  : 'カード情報の登録を処理しています。\nしばらくお待ちください。'
                }
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 text-green-500">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isPaymentMethodChangeOnly ? '支払い方法変更完了' : 'カード登録完了'}
              </h2>
              <p className="text-gray-600 mb-6">
                {isPaymentMethodChangeOnly
                  ? 'カード情報の変更が完了しました。\nマイページに戻ります。'
                  : 'カード登録が完了しました。\nマイページに戻ります。'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
