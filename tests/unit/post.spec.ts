import { describe, expect, it } from 'vitest'
import {
  MAX_RENDER,
  buildPost,
  createPostId,
  normalizePosts,
  sortByCreatedAtDesc,
} from '@/lib/post'
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

describe('normalizePosts', () => {
  it('非数组输入返回空数组', () => {
    expect(normalizePosts(null)).toEqual([])
    expect(normalizePosts({})).toEqual([])
    expect(normalizePosts('abc')).toEqual([])
  })

  it('过滤缺少关键字段的非法项', () => {
    const raw = [
      makePost(),
      { id: 'x', content: '缺少时间' },
      { id: '', content: '空 id', createdAt: 1, author: '我' },
      { id: 'y', content: '   ', createdAt: 2, author: '我' },
      { id: 'z', content: '非法时间', createdAt: 'not-a-number', author: '我' },
      null,
      42,
    ]
    const result = normalizePosts(raw)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('id-1')
  })

  it('为缺失 author 的项补默认作者', () => {
    const result = normalizePosts([{ id: 'a', content: 'hi', createdAt: 100 }])
    expect(result[0]).toEqual({ id: 'a', content: 'hi', createdAt: 100, author: '我' })
  })

  it('保留合法项内容原样（不做 trim）', () => {
    const result = normalizePosts([makePost({ content: '  hello  ' })])
    expect(result[0]!.content).toBe('  hello  ')
  })
})

describe('sortByCreatedAtDesc', () => {
  it('按创建时间倒序排列且不修改原数组', () => {
    const list = [makePost({ id: 'a', createdAt: 1 }), makePost({ id: 'c', createdAt: 3 }), makePost({ id: 'b', createdAt: 2 })]
    const sorted = sortByCreatedAtDesc(list)
    expect(sorted.map((item) => item.id)).toEqual(['c', 'b', 'a'])
    expect(list.map((item) => item.id)).toEqual(['a', 'c', 'b'])
  })

  it('时间相同时保持原顺序稳定', () => {
    const list = [makePost({ id: 'a', createdAt: 5 }), makePost({ id: 'b', createdAt: 5 })]
    expect(sortByCreatedAtDesc(list).map((item) => item.id)).toEqual(['a', 'b'])
  })
})

describe('createPostId', () => {
  it('生成非空且不重复的 id', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createPostId()))
    expect(ids.size).toBe(200)
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0))
  })
})

describe('buildPost', () => {
  it('使用 trim 后的内容并写入时间与作者', () => {
    const post = buildPost('  hi  ', 12345, 'fixed-id')
    expect(post).toEqual({ id: 'fixed-id', content: 'hi', createdAt: 12345, author: '我' })
  })

  it('不传 id 时自动生成', () => {
    const post = buildPost('hi', 1)
    expect(post.id.length).toBeGreaterThan(0)
  })
})

describe('常量', () => {
  it('渲染上限为 200', () => {
    expect(MAX_RENDER).toBe(200)
  })
})
