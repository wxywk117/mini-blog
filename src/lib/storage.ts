import { normalizePosts, sortByCreatedAtDesc } from '@/lib/post'
import type { Post, StorageLike } from '@/types/post'

/** 版本化存储键，与旧版纯静态实现保持一致，保证数据可迁移 */
export const STORAGE_KEY = 'miniblog.posts.v1'

export interface PostsStorage {
  readonly isAvailable: boolean
  read(): Post[]
  write(list: Post[]): boolean
}

/**
 * 基于 localStorage 的动态存储。
 * provider 可注入，便于测试「写入抛异常」「存储被禁用」等边界场景。
 */
export function createPostsStorage(provider: StorageLike = window.localStorage): PostsStorage {
  let available = true
  try {
    provider.getItem(STORAGE_KEY)
  } catch {
    available = false
  }

  return {
    get isAvailable() {
      return available
    },

    read(): Post[] {
      if (!available) return []
      let raw: string | null = null
      try {
        raw = provider.getItem(STORAGE_KEY)
      } catch {
        available = false
        return []
      }
      if (!raw) return []

      try {
        const parsed: unknown = JSON.parse(raw)
        return sortByCreatedAtDesc(normalizePosts(parsed))
      } catch {
        // 数据损坏时降级为空列表，且不覆盖原始内容，便于人工排查
        console.warn('[MiniBlog] 本地数据解析失败，已降级为空列表（原始数据保留未覆盖）')
        return []
      }
    },

    write(list: Post[]): boolean {
      if (!available) return false
      try {
        provider.setItem(STORAGE_KEY, JSON.stringify(list))
        return true
      } catch {
        console.warn('[MiniBlog] 本地数据写入失败')
        return false
      }
    },
  }
}
