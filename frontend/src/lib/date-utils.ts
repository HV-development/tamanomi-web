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

const jstIsoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
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

/**
 * nextBillingDate を進めるのは日次バッチ(0:30 JST)だけなので、課金日当日は初回課金日の
 * ままになる。過ぎた日を「次回」として出さないよう、JST 日付で明日以降のときだけ true。
 */
export function isFutureBillingDate(
  value: Date | string | null | undefined,
): value is Date | string {
  if (!value) return false
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return false
  return jstIsoDateFormatter.format(date) > jstIsoDateFormatter.format(new Date())
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
