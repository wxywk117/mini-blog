import type { Ref } from 'vue'

/**
 * 文本域高度随内容自适应，超过 maxHeight 后内部滚动。
 */
export function useAutoResize(target: Ref<HTMLTextAreaElement | null>, maxHeight = 200) {
  function resize(): void {
    const element = target.value
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
  }

  return { resize }
}
