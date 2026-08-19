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

const jstMonthDayFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
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

/**
 * 無料期間終了後の初回課金日ラベル（例: 9月18日）。
 * 加算式は API 側の初回課金日算出（カード登録日 + freeDays）と揃えている。
 */
export function computeCampaignNextBillingLabel(freeDays: number): string {
  const target = new Date(Date.now() + freeDays * 24 * 60 * 60 * 1000)
  return jstMonthDayFormatter.format(target)
}

/** YYYYMMDD 形式の日付を「9月18日」形式にする。 */
export function formatCompactYmdToMonthDay(compactYmd: string): string {
  const year = Number(compactYmd.slice(0, 4))
  const month = Number(compactYmd.slice(4, 6))
  const day = Number(compactYmd.slice(6, 8))
  return jstMonthDayFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)))
}
