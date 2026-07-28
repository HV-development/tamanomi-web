const jstSlashDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

const jstJapaneseDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatJstDate(iso: string): string {
  return jstSlashDateFormatter.format(new Date(iso))
}

export function formatJstYmd(iso: string): string {
  return jstJapaneseDateFormatter.format(new Date(iso))
}

export function isCampaignFreePeriodActive(firstBillingDateIso: string): boolean {
  const firstBillingDate = new Date(firstBillingDateIso).getTime()
  return Number.isFinite(firstBillingDate) && firstBillingDate > Date.now()
}

export function computeFreePeriodEnd(firstBillingDateIso: string): string {
  const d = new Date(firstBillingDateIso)
  d.setUTCDate(d.getUTCDate() - 1)
  return formatJstDate(d.toISOString())
}

export function computeFreePeriodEndYmd(firstBillingDateIso: string): string {
  const d = new Date(firstBillingDateIso)
  d.setUTCDate(d.getUTCDate() - 1)
  return formatJstYmd(d.toISOString())
}
