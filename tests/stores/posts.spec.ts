import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePostsStore } from '@/stores/posts'
import { STORAGE_KEY } from '@/lib/storage'
import type { Post } from '@/types/post'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'id-1',
    content: '内容',
    createdAt: 1_700_000_000_000,
    author: '我',
    ...overrides,
  }
}

function seed(posts: Post[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

describe('usePostsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始为空列表', () => {
    const store = usePostsStore()
    store.load()
    expect(store.posts).toEqual([])
    expect(store.count).toBe(0)
    expect(store.isEmpty).toBe(true)
    expect(store.visiblePosts).toEqual([])
  })

  it('load 读取本地数据并按时间倒序', () => {
    seed([
      makePost({ id: 'a', createdAt: 1 }),
      makePost({ id: 'c', createdAt: 3 }),
      makePost({ id: 'b', createdAt: 2 }),
    ])
    const store = usePostsStore()
    store.load()
    expect(store.posts.map((post) => post.id)).toEqual(['c', 'b', 'a'])
    expect(store.count).toBe(3)
    expect(store.isEmpty).toBe(false)
  })

  it('addPost 将新动态放到列表首位并写入本地存储', () => {
    seed([makePost({ id: 'old', createdAt: 1 })])
    const store = usePostsStore()
    store.load()

    const ok = store.addPost('  新的一条  ')

    expect(ok).toBe(true)
    expect(store.posts).toHaveLength(2)
    expect(store.posts[0]!.content).toBe('新的一条')
    expect(store.posts[0]!.author).toBe('我')
    expect(store.posts[0]!.createdAt).toBeGreaterThan(1)
    expect(store.statusMessage).toBe('')

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!) as Post[]
    expect(stored[0]!.content).toBe('新的一条')
  })

  it('addPost 拒绝空内容并给出提示', () => {
    const store = usePostsStore()
    store.load()

    expect(store.addPost('   ')).toBe(false)
    expect(store.posts).toEqual([])
    expect(store.statusMessage).not.toBe('')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('addPost 拒绝超长内容并给出提示', () => {
    const store = usePostsStore()
    store.load()

    expect(store.addPost('a'.repeat(281))).toBe(false)
    expect(store.posts).toEqual([])
    expect(store.statusMessage).toContain('超出')
  })

  it('addPost 在写入失败时保留内存数据并提示保存失败', () => {
    const store = usePostsStore()
    store.load()
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const ok = store.addPost('写入会失败')

    expect(ok).toBe(true)
    expect(store.posts).toHaveLength(1)
    expect(store.statusMessage).toContain('保存失败')
    spy.mockRestore()
  })

  it('removePost 删除指定动态并写回存储', () => {
    seed([
      makePost({ id: 'a', createdAt: 1 }),
      makePost({ id: 'b', createdAt: 2 }),
    ])
    const store = usePostsStore()
    store.load()

    store.removePost('b')

    expect(store.posts.map((post) => post.id)).toEqual(['a'])
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!) as Post[]
    expect(stored.map((post) => post.id)).toEqual(['a'])
  })

  it('removePost 对不存在的 id 保持数据不变', () => {
    seed([makePost({ id: 'a', createdAt: 1 })])
    const store = usePostsStore()
    store.load()

    store.removePost('not-exist')

    expect(store.posts.map((post) => post.id)).toEqual(['a'])
  })

  it('visiblePosts 最多返回 200 条（最新的在前）', () => {
    const list = Array.from({ length: 250 }, (_, index) =>
      makePost({ id: `id-${index}`, createdAt: index + 1 })
    )
    seed(list)
    const store = usePostsStore()
    store.load()

    expect(store.count).toBe(250)
    expect(store.visiblePosts).toHaveLength(200)
    expect(store.visiblePosts[0]!.id).toBe('id-249')
    expect(store.visiblePosts[199]!.id).toBe('id-50')
  })

  it('clearStatus 清空提示信息', () => {
    const store = usePostsStore()
    store.load()
    store.addPost('')
    expect(store.statusMessage).not.toBe('')

    store.clearStatus()

    expect(store.statusMessage).toBe('')
  })

  it('数据损坏时 load 降级为空列表且不抛错', () => {
    window.localStorage.setItem(STORAGE_KEY, '{{{')
    const store = usePostsStore()

    expect(() => store.load()).not.toThrow()
    expect(store.posts).toEqual([])
  })
})
