import { beforeEach, vi } from 'vitest'

/**
 * jsdom 未实现部分浏览器 API，这里补最小实现，
 * 避免组件测试因为环境能力缺失而失败。
 */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// jsdom 未实现 confirm，默认按「用户点击确定」处理；需要取消行为的用例通过 confirmFn 注入
window.confirm = vi.fn(() => true)

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  window.localStorage.clear()
  vi.useRealTimers()
})
