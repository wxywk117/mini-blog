/** 一条动态 */
export interface Post {
  id: string
  content: string
  createdAt: number
  author: string
}

/** 仅依赖 localStorage 的两个方法，便于测试时注入内存实现 */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type ValidationReason = 'empty' | 'too-long'

export interface ValidationResult {
  ok: boolean
  reason?: ValidationReason
  /** 原始输入（未 trim）的码点长度，与输入框计数保持一致 */
  length: number
  /** trim 后的内容 */
  trimmed: string
}
