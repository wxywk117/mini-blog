import type { Post } from '@/types/post'

/** 单条动态的默认作者（本地单用户） */
export const DEFAULT_AUTHOR = '我'
/** 单次渲染上限，避免极端数据量下的性能问题 */
export const MAX_RENDER = 200

interface RawPost {
  id?: unknown
  content?: unknown
  createdAt?: unknown
  author?: unknown
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * 过滤非法数据并补全缺失字段：
 * 存储内容可能因手工修改、旧版本或异常写入而损坏，这里统一收敛为合法 Post[]。
 */
export function normalizePosts(raw: unknown): Post[] {
  if (!Array.isArray(raw)) return []

  return raw.reduce<Post[]>((acc, item) => {
    if (!item || typeof item !== 'object') return acc
    const candidate = item as RawPost
    const { id, content, createdAt, author } = candidate

    const validId = typeof id === 'string' && id.length > 0
    const validContent = typeof content === 'string' && content.trim().length > 0
    const validTime = isFiniteNumber(createdAt)
    if (!validId || !validContent || !validTime) return acc

    acc.push({
      id: id as string,
      content: content as string,
      createdAt: createdAt as number,
      author: typeof author === 'string' && author.length > 0 ? author : DEFAULT_AUTHOR,
    })
    return acc
  }, [])
}

/** 按创建时间倒序，返回新数组（不修改入参） */
export function sortByCreatedAtDesc(list: Post[]): Post[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt)
}

/** 生成唯一 id：优先 crypto.randomUUID，不可用时回退时间戳 + 随机串 */
export function createPostId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      // 忽略异常，走回退方案
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 构造一条待写入的动态 */
export function buildPost(content: string, createdAt: number, id: string = createPostId()): Post {
  return {
    id,
    content: content.trim(),
    createdAt,
    author: DEFAULT_AUTHOR,
  }
}
