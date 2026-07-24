"use client"

import { useEffect, useState } from "react"

export function useCampaignAvailability(enabled: boolean): boolean {
  const [hasActive, setHasActive] = useState<boolean>(false)

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
        const data = await res.json()
        if (cancelled) return
        setHasActive(data?.hasActive === true)
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
