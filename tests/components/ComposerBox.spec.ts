import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ComposerBox from '@/components/ComposerBox.vue'

function mountComposer(props: Record<string, unknown> = {}) {
  return mount(ComposerBox, { props })
}

describe('ComposerBox', () => {
  it('初始计数为 0 且发布按钮禁用', () => {
    const wrapper = mountComposer()
    expect(wrapper.get('#char-counter').text()).toBe('已输入 0 / 280')
    expect(wrapper.get('#publish-btn').attributes('disabled')).toBeDefined()
  })

  it('输入内容后计数更新且按钮可用', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('hello')

    expect(wrapper.get('#char-counter').text()).toBe('已输入 5 / 280')
    expect(wrapper.get('#publish-btn').attributes('disabled')).toBeUndefined()
  })

  it('接近上限时计数进入警示态', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('a'.repeat(255))

    expect(wrapper.get('#char-counter').classes()).toContain('is-warning')
  })

  it('超过 280 字符时禁用提交并提示超出数量', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('a'.repeat(281))

    expect(wrapper.get('#char-counter').text()).toBe('已超出 1 个字符')
    expect(wrapper.get('#char-counter').classes()).toContain('is-danger')
    expect(wrapper.get('#publish-btn').attributes('disabled')).toBeDefined()
  })

  it('纯空白内容不允许提交', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('    ')

    expect(wrapper.get('#publish-btn').attributes('disabled')).toBeDefined()
  })

  it('点击发布按钮抛出 submit 事件并携带原始输入', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('  新动态  ')
    await wrapper.get('#publish-btn').trigger('click')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0]).toEqual(['  新动态  '])
  })

  it('Ctrl+Enter 触发提交', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('快捷发布')
    await wrapper.get('#composer-input').trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('Cmd+Enter 触发提交', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('快捷发布')
    await wrapper.get('#composer-input').trigger('keydown', { key: 'Enter', metaKey: true })

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('空内容时快捷发布不触发提交', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('展示外部传入的错误提示', () => {
    const wrapper = mountComposer({ statusMessage: '保存失败，当前内容仅保留在页面中' })
    expect(wrapper.get('#status-message').text()).toBe('保存失败，当前内容仅保留在页面中')
  })

  it('reset 清空输入并复位计数', async () => {
    const wrapper = mountComposer()
    await wrapper.get('#composer-input').setValue('待清空')
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    const input = wrapper.get('#composer-input').element as HTMLTextAreaElement
    expect(input.value).toBe('')
    expect(wrapper.get('#char-counter').text()).toBe('已输入 0 / 280')
    expect(wrapper.get('#publish-btn').attributes('disabled')).toBeDefined()
  })
})
