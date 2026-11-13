import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, createPostsStorage } from '@/lib/storage'
import type { Post, StorageLike } from '@/types/post'

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & {
  readonly data: Record<string, string>
} {
  const data: Record<string, string> = { ...initial }
  return {
    data,
    getItem: (key: string) => (key in data ? data[key]! : null),
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

const sample: Post[] = [{ id: 'a', content: 'hi', createdAt: 1, author: '我' }]

describe('createPostsStorage', () => {
  it('存储键沿用旧版 miniblog.posts.v1', () => {
    expect(STORAGE_KEY).toBe('miniblog.posts.v1')
  })

  it('键不存在时读取为空数组', () => {
    const storage = createPostsStorage(createMemoryStorage())
    expect(storage.read()).toEqual([])
  })

  it('写入后可完整读回', () => {
    const provider = createMemoryStorage()
    const storage = createPostsStorage(provider)
    expect(storage.write(sample)).toBe(true)
    expect(provider.data[STORAGE_KEY]).toBe(JSON.stringify(sample))
    expect(storage.read()).toEqual(sample)
  })

  it('JSON 损坏时降级为空数组且不覆盖原始数据', () => {
    const provider = createMemoryStorage({ [STORAGE_KEY]: '{{{' })
    const storage = createPostsStorage(provider)
    expect(storage.read()).toEqual([])
    expect(provider.data[STORAGE_KEY]).toBe('{{{')
  })

  it('值为非数组时降级为空数组', () => {
    const provider = createMemoryStorage({ [STORAGE_KEY]: '{"a":1}' })
    expect(createPostsStorage(provider).read()).toEqual([])
  })

  it('存储中混有非法项时只返回合法项', () => {
    const provider = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify([sample[0], { id: 'bad' }, null]),
    })
    expect(createPostsStorage(provider).read()).toEqual(sample)
  })

  it('写入抛异常时返回 false 且不抛出', () => {
    const provider: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const storage = createPostsStorage(provider)
    expect(storage.write(sample)).toBe(false)
  })

  it('存储完全不可用时 isAvailable 为 false 且读写安全', () => {
    const provider: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }
    const storage = createPostsStorage(provider)
    expect(storage.isAvailable).toBe(false)
    expect(storage.read()).toEqual([])
    expect(storage.write(sample)).toBe(false)
  })

  it('默认使用 window.localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
    expect(createPostsStorage().read()).toEqual(sample)
  })
})
