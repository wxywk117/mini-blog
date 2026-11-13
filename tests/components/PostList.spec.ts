import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostList from '@/components/PostList.vue'
import type { Post } from '@/types/post'

function makePost(index: number): Post {
  return {
    id: `id-${index}`,
    content: `第 ${index} 条`,
    createdAt: 1_700_000_000_000 - index * 1000,
    author: '我',
  }
}

describe('PostList', () => {
  it('无数据时展示空状态并隐藏列表', () => {
    const wrapper = mount(PostList, { props: { posts: [] } })

    expect(wrapper.get('#empty-state').isVisible()).toBe(true)
    expect(wrapper.get('#empty-state').text()).toContain('还没有任何动态')
    expect(wrapper.findAll('.mb-post')).toHaveLength(0)
    expect(wrapper.get('#feed-summary').text()).toBe('共 0 条')
  })

  it('有数据时隐藏空状态并渲染全部卡片', () => {
    const wrapper = mount(PostList, { props: { posts: [makePost(1), makePost(2)] } })

    expect(wrapper.find('#empty-state').exists()).toBe(false)
    expect(wrapper.findAll('.mb-post')).toHaveLength(2)
    expect(wrapper.get('#feed-summary').text()).toBe('共 2 条')
  })

  it('卡片删除事件向上冒泡并携带 id', async () => {
    const wrapper = mount(PostList, { props: { posts: [makePost(1), makePost(2)] } })

    await wrapper.findAll('[data-action="delete"]')[1]!.trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual(['id-2'])
  })

  it('删除前会调用确认函数，取消时不抛出事件', async () => {
    const wrapper = mount(PostList, {
      props: { posts: [makePost(1)], confirmFn: () => false },
    })

    await wrapper.get('[data-action="delete"]').trigger('click')

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('确认后抛出删除事件', async () => {
    const wrapper = mount(PostList, {
      props: { posts: [makePost(1)], confirmFn: () => true },
    })

    await wrapper.get('[data-action="delete"]').trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual(['id-1'])
  })

  it('按列表顺序渲染（最新在前由上层保证）', () => {
    const wrapper = mount(PostList, { props: { posts: [makePost(1), makePost(2), makePost(3)] } })
    const ids = wrapper.findAll('.mb-post').map((node) => node.attributes('data-id'))

    expect(ids).toEqual(['id-1', 'id-2', 'id-3'])
  })
})
