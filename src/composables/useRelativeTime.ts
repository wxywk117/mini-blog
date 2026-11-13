import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 提供每 60 秒更新的「当前时间」引用，用于相对时间文案自动刷新。
 * 页面重新可见时立即刷新一次，避免后台标签页的时间滞后。
 */
export function useRelativeTime(interval = 60_000) {
  const now = ref(Date.now())
  let timer: number | undefined

  const tick = (): void => {
    now.value = Date.now()
  }

  const handleVisibility = (): void => {
    if (!document.hidden) tick()
  }

  onMounted(() => {
    tick()
    timer = window.setInterval(tick, interval)
    document.addEventListener('visibilitychange', handleVisibility)
  })

  onBeforeUnmount(() => {
    if (timer !== undefined) window.clearInterval(timer)
    document.removeEventListener('visibilitychange', handleVisibility)
  })

  return { now, tick }
}
