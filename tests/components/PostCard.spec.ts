import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostCard from '@/components/PostCard.vue'
import { formatAbsoluteTime } from '@/lib/time'
import type { Post } from '@/types/post'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'id-1',
    content: '一条测试动态',
    createdAt: Date.now() - 60 * 1000,
    author: '我',
    ...overrides,
  }
}

describe('PostCard', () => {
  it('渲染作者、正文与相对时间', () => {
    const wrapper = mount(PostCard, { props: { post: makePost() } })

    expect(wrapper.get('.mb-post__author').text()).toBe('我')
    expect(wrapper.get('.mb-post__body').text()).toBe('一条测试动态')
    expect(wrapper.get('.mb-post__time').text()).toBe('1 分钟前')
  })

  it('时间节点带 data-ts 与绝对时间 title', () => {
    const createdAt = new Date('2026-03-04T05:06:00').getTime()
    const wrapper = mount(PostCard, { props: { post: makePost({ createdAt }) } })
    const time = wrapper.get('.mb-post__time')

    expect(time.attributes('data-ts')).toBe(String(createdAt))
    expect(time.attributes('title')).toBe(formatAbsoluteTime(createdAt))
  })

  it('正文以纯文本渲染，不解析 HTML', () => {
    const wrapper = mount(PostCard, {
      props: { post: makePost({ content: '<img src=x onerror="alert(1)"> <b>加粗</b>' }) },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('b').exists()).toBe(false)
    expect(wrapper.get('.mb-post__body').text()).toContain('<img src=x onerror="alert(1)">')
  })

  it('保留正文换行（white-space: pre-wrap 依赖真实换行符）', () => {
    const wrapper = mount(PostCard, { props: { post: makePost({ content: '第一行\n第二行' }) } })
    expect(wrapper.get('.mb-post__body').element.textContent).toBe('第一行\n第二行')
  })

  it('点击删除按钮抛出 delete 事件并携带 id', async () => {
    const wrapper = mount(PostCard, { props: { post: makePost({ id: 'abc' }) } })
    await wrapper.get('[data-action="delete"]').trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual(['abc'])
  })

  it('删除按钮有可读的无障碍名称', () => {
    const wrapper = mount(PostCard, { props: { post: makePost() } })
    expect(wrapper.get('[data-action="delete"]').attributes('aria-label')).toBe('删除这条动态')
  })
})
