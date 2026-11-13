import { describe, expect, it } from 'vitest'
import { formatAbsoluteTime, formatRelativeTime, pad2 } from '@/lib/time'

const NOW = new Date('2026-11-13T10:00:00').getTime()
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('pad2', () => {
  it('不足两位补零', () => {
    expect(pad2(1)).toBe('01')
    expect(pad2(9)).toBe('09')
    expect(pad2(10)).toBe('10')
    expect(pad2(59)).toBe('59')
  })
})

describe('formatRelativeTime', () => {
  it('1 分钟内显示刚刚', () => {
    expect(formatRelativeTime(NOW - 59 * SECOND, NOW)).toBe('刚刚')
    expect(formatRelativeTime(NOW, NOW)).toBe('刚刚')
  })

  it('未来时间按刚刚处理', () => {
    expect(formatRelativeTime(NOW + 5 * MINUTE, NOW)).toBe('刚刚')
  })

  it('60 秒起显示分钟', () => {
    expect(formatRelativeTime(NOW - MINUTE, NOW)).toBe('1 分钟前')
    expect(formatRelativeTime(NOW - 59 * MINUTE, NOW)).toBe('59 分钟前')
  })

  it('60 分钟起显示小时', () => {
    expect(formatRelativeTime(NOW - HOUR, NOW)).toBe('1 小时前')
    expect(formatRelativeTime(NOW - 23 * HOUR, NOW)).toBe('23 小时前')
  })

  it('24 小时起显示天', () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe('1 天前')
    expect(formatRelativeTime(NOW - 6 * DAY, NOW)).toBe('6 天前')
  })

  it('满 7 天起显示具体日期', () => {
    expect(formatRelativeTime(NOW - 7 * DAY, NOW)).toBe('2026-11-06')
    expect(formatRelativeTime(new Date('2025-01-05T08:30:00').getTime(), NOW)).toBe('2025-01-05')
  })

  it('不传 now 时使用当前时间', () => {
    expect(formatRelativeTime(Date.now() - 2 * MINUTE)).toBe('2 分钟前')
  })
})

describe('formatAbsoluteTime', () => {
  it('输出 YYYY-MM-DD HH:mm', () => {
    expect(formatAbsoluteTime(new Date('2026-03-04T05:06:00').getTime())).toBe('2026-03-04 05:06')
  })

  it('月日时分补零', () => {
    expect(formatAbsoluteTime(new Date('2026-01-02T03:04:00').getTime())).toBe('2026-01-02 03:04')
  })
})
