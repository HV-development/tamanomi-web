"use client"

import { useEffect, useState } from "react"

type MyActiveCampaignResponse =
  | { hasActiveCampaign: false }
  | {
      hasActiveCampaign: true
      application: {
        id: string
        freeDaysApplied: number
        firstBillingDate: string
        appliedAt: string
        campaign: { id: string; name: string }
        plan: { id: string; name: string; price: number }
      }
    }

export function useMyActiveCampaign() {
  const [hasActiveCampaign, setHasActiveCampaign] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchCampaign = async () => {
      try {
        const response = await fetch("/api/campaigns/me/current", {
          credentials: "include",
          cache: "no-store",
        })
        if (!response.ok) {
          if (!cancelled) setHasActiveCampaign(false)
          return
        }
        const data: MyActiveCampaignResponse = await response.json()
        if (!cancelled) setHasActiveCampaign(data.hasActiveCampaign)
      } catch {
        if (!cancelled) setHasActiveCampaign(false)
      }
    }
    fetchCampaign()
    return () => {
      cancelled = true
    }
  }, [])

  return { hasActiveCampaign }
}
