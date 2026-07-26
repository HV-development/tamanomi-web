"use client"

import { useEffect, useState } from "react"
import type { CampaignAvailabilityResponse } from "@hv-development/schemas"

// fail-open: API 失敗時は表示のまま。
// キャンペーン開催中に誤って非表示にすると、コード入力欄が無いまま登録完走して
// 無料期間なしで即時課金される (返金・問い合わせ対応の実害)。
// 逆方向 (0 件なのに表示) の失敗コストはサーバー側 validate で弾かれるだけなので許容。
export function useCampaignAvailability(enabled: boolean): boolean {
  const [hasActive, setHasActive] = useState<boolean>(true)

  useEffect(() => {
    if (!enabled) {
      setHasActive(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/campaigns/available', { credentials: 'include' })
        if (!res.ok) return
        const data = (await res.json()) as CampaignAvailabilityResponse
        if (cancelled) return
        setHasActive(data.hasActive !== false)
      } catch {
        return
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return hasActive
}
