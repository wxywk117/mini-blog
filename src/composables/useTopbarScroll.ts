import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 滚动超过阈值时为顶栏追加 is-scrolled 类，触发毛玻璃与分割线 */
export function useTopbarScroll(threshold = 8) {
  const scrolled = ref(false)

  const handleScroll = (): void => {
    scrolled.value = window.scrollY > threshold
  }

  onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return { scrolled }
}
