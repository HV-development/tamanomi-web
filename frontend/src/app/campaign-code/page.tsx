'use client'

import { useRouter } from "next/navigation"
import { CampaignCodePage } from "@/components/templates/CampaignCodePage"

export default function CampaignCode() {
  const router = useRouter()

  return <CampaignCodePage onBack={() => router.push("/email-registration")} />
}

