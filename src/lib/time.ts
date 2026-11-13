const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

/**
 * 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 / YYYY-MM-DD
 * now 显式传入，便于测试与「每 60 秒刷新」的响应式实现复用。
 */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp)

  if (diff < MINUTE) return '刚刚'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} 分钟前`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} 天前`

  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** 绝对时间：YYYY-MM-DD HH:mm，用于 title 提示 */
export function formatAbsoluteTime(timestamp: number): string {
  const date = new Date(timestamp)
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    ` ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  )
}
