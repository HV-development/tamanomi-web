"use client"

import { useEffect, useState } from "react"
import type { PlanManagementCampaignInfo } from "@/components/molecules/PlanManagement"

export function useCurrentCampaign(enabled: boolean): PlanManagementCampaignInfo | null {
  const [campaignInfo, setCampaignInfo] = useState<PlanManagementCampaignInfo | null>(null)

  useEffect(() => {
    if (!enabled) {
      setCampaignInfo(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/campaigns/me/current', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data?.hasActiveCampaign && data.application) {
          setCampaignInfo({
            freeDaysApplied: data.application.freeDaysApplied,
            firstBillingDate: data.application.firstBillingDate,
            appliedAt: data.application.appliedAt,
          })
        } else {
          setCampaignInfo(null)
        }
      } catch {
        return
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return campaignInfo
}
