import { describe, it, expect } from 'vitest'
import { computeCampaignNextBillingLabel, formatCompactYmdToMonthDay } from '@/lib/date-utils'

describe('computeCampaignNextBillingLabel', () => {
  it('JST の日跨ぎ直前は当日を起点に算出する', () => {
    expect(computeCampaignNextBillingLabel(30, Date.parse('2026-08-19T14:59:00Z'))).toBe('9月18日')
  })

  it('JST の日跨ぎ直後は翌日を起点に算出する', () => {
    expect(computeCampaignNextBillingLabel(30, Date.parse('2026-08-19T15:01:00Z'))).toBe('9月19日')
  })

  it('無料日数 1 日は翌日になる', () => {
    expect(computeCampaignNextBillingLabel(1, Date.parse('2026-08-19T03:00:00Z'))).toBe('8月20日')
  })
})

describe('formatCompactYmdToMonthDay', () => {
  it('YYYYMMDD を「9月18日」形式にする', () => {
    expect(formatCompactYmdToMonthDay('20260918')).toBe('9月18日')
  })

  it('年始でも JST 変換で前日にならない', () => {
    expect(formatCompactYmdToMonthDay('20260101')).toBe('1月1日')
  })

  it('存在しない日付は空文字を返す', () => {
    expect(formatCompactYmdToMonthDay('20261345')).toBe('')
    expect(formatCompactYmdToMonthDay('20260230')).toBe('')
    expect(formatCompactYmdToMonthDay('20260000')).toBe('')
  })

  it('8桁の数字でない入力は空文字を返す', () => {
    expect(formatCompactYmdToMonthDay('2026091')).toBe('')
    expect(formatCompactYmdToMonthDay('2026-09-18')).toBe('')
    expect(formatCompactYmdToMonthDay('')).toBe('')
  })
})
