import type { ValidationResult } from '@/types/post'

/** 单条内容字数上限 */
export const MAX_LEN = 280
/** 接近上限的提醒阈值 */
export const WARN_LEN = 250

/**
 * 按 Unicode 码点统计长度，避免表情符号被算成 2 个字符。
 */
export function charLength(text: string): number {
  return Array.from(text).length
}

/**
 * 发布前的内容校验：空内容与超长内容均不允许提交。
 * 长度统计使用原始输入（含首尾空白），与输入框计数展示一致。
 */
export function validateContent(raw: string, maxLen: number = MAX_LEN): ValidationResult {
  const trimmed = raw.trim()
  const length = charLength(raw)

  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty', length, trimmed }
  }
  if (length > maxLen) {
    return { ok: false, reason: 'too-long', length, trimmed }
  }
  return { ok: true, length, trimmed }
}

/**
 * 输入框计数文案：未超限展示进度，超限展示超出数量。
 */
export function formatCounter(length: number, maxLen: number = MAX_LEN): string {
  if (length > maxLen) {
    return `已超出 ${length - maxLen} 个字符`
  }
  return `已输入 ${length} / ${maxLen}`
}
