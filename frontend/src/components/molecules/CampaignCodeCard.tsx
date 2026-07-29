"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { ApiClient } from "@/lib/api-client"

export interface AppliedCampaign {
  id: string
  name: string
  freeDays: number
  code: string
}

interface CampaignCodeCardProps {
  appliedCampaign: AppliedCampaign | null
  onApplied: (campaign: AppliedCampaign) => void
}

interface ValidateSuccessResponse {
  valid: true
  campaign: { id: string; name: string; freeDays: number }
  display: { priceMain: string; pricePeriod: string; priceNote: string }
}

interface ValidateFailureResponse {
  valid: false
  reason: 'INVALID_CODE' | 'ALREADY_REDEEMED'
  message: string
}

type ValidateResponse = ValidateSuccessResponse | ValidateFailureResponse

const CODE_PATTERN = /^[a-z0-9]{6,20}$/

export function CampaignCodeCard({ appliedCampaign, onApplied }: CampaignCodeCardProps) {
  const [code, setCode] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isApplying, setIsApplying] = useState<boolean>(false)

  const isApplied = appliedCampaign !== null
  const displayFreeDays = appliedCampaign?.freeDays ?? 30
  const displayNextDay = displayFreeDays + 1

  const handleChange = (value: string) => {
    setCode(value.slice(0, 40))
    if (errorMessage) setErrorMessage("")
  }

  const handleApply = async () => {
    const normalized = code.trim().toLowerCase()
    if (!normalized) {
      setErrorMessage("キャンペーンコードは必須です")
      return
    }
    if (!CODE_PATTERN.test(normalized)) {
      setErrorMessage("6〜20文字の英小文字・半角数字で入力してください")
      return
    }

    setIsApplying(true)
    setErrorMessage("")

    const result = await ApiClient.post<ValidateResponse>('/api/campaigns/validate', { code: normalized })

    setIsApplying(false)

    if (result.error) {
      setErrorMessage(result.error.message || "検証に失敗しました")
      return
    }

    const data = result.data
    if (!data) {
      setErrorMessage("検証に失敗しました")
      return
    }

    if (data.valid) {
      onApplied({
        id: data.campaign.id,
        name: data.campaign.name,
        freeDays: data.campaign.freeDays,
        code: normalized,
      })
      setCode(normalized)
      return
    }

    if (data.reason === 'INVALID_CODE') {
      setErrorMessage("このコードは無効です")
    } else if (data.reason === 'ALREADY_REDEEMED') {
      setErrorMessage("すでにキャンペーンをご利用済みです")
    } else {
      setErrorMessage(data.message || "コードが無効です")
    }
  }

  return (
    <div className="w-full rounded-2xl border border-[#d9d9d9] bg-white p-6 space-y-4">
      <div className="space-y-3">
        <p className="text-base font-semibold text-black">キャンペーンコードをお持ちですか？</p>
        <div className="flex items-end gap-1">
          <p className="text-[24px] font-semibold leading-none text-[#049a2a]">￥0</p>
          <p className="text-[12px] text-[#a6a6a6]">/最初の{displayFreeDays}日間</p>
        </div>
        <p className="text-[12px] text-[#a6a6a6]">{displayNextDay}日目以降はプラン料金</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1.5">
            <div
              className={`relative flex h-10 items-center rounded-[10px] border px-3 ${
                isApplied ? "border-[#049a2a] bg-white" : "border-[#d9d9d9] bg-white"
              }`}
            >
              <input
                type="text"
                value={code}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="キャンペーンコード"
                disabled={isApplied || isApplying}
                className="flex-1 bg-transparent text-base font-medium text-black placeholder:text-[#9aa39a] focus:outline-none disabled:cursor-not-allowed"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {isApplied && (
                <Check className="h-4 w-4 flex-shrink-0 text-[#049a2a]" strokeWidth={3} />
              )}
            </div>
            {errorMessage && (
              <p className="text-xs text-[#ea3323]">{errorMessage}</p>
            )}
          </div>
          {isApplied ? (
            <button
              type="button"
              disabled
              className="shrink-0 cursor-not-allowed rounded-lg border border-[#049a2a] bg-[#f0fdf4] px-2 py-3 text-sm font-semibold text-[#049a2a]"
            >
              適用済み
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="shrink-0 rounded-lg bg-[#049a2a] px-2 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isApplying ? "確認中..." : "適用する"}
            </button>
          )}
        </div>
        <div className="flex justify-start">
          <a
            href="https://receipt-quest.saitama-tsunagu.com/#tokten"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-b border-[#3273f6] pb-[2px] text-[10px] text-[#3273f6]"
          >
            キャンペーンについてはこちら
          </a>
        </div>
      </div>

      {isApplied && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(4,154,42,0.24)] bg-[#f0fdf4] p-2.5">
          <Check className="h-4 w-4 text-[#049a2a]" strokeWidth={3} />
          <p className="text-xs font-bold text-[#33803f]">
            最初の{displayFreeDays}日間無料 でご利用いただけます！
          </p>
        </div>
      )}
    </div>
  )
}
