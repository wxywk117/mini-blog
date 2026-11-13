import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { MAX_RENDER, buildPost, sortByCreatedAtDesc } from '@/lib/post'
import { createPostsStorage } from '@/lib/storage'
import { validateContent } from '@/lib/text'
import type { Post } from '@/types/post'

const MESSAGES = {
  empty: '内容不能为空',
  tooLong: '内容超出上限，请删减后再发布',
  saveFailed: '保存失败，当前内容仅保留在页面中',
  storageUnavailable: '当前环境不可用本地存储，刷新后数据会丢失',
} as const

/**
 * 动态列表状态：唯一数据源，所有读写副作用都集中在这里。
 * 使用 setup store，getters 均为 computed，组件只消费状态与调用 action。
 */
export const usePostsStore = defineStore('posts', () => {
  const storage = createPostsStorage()

  const posts = ref<Post[]>([])
  const statusMessage = ref('')

  const count = computed(() => posts.value.length)
  const isEmpty = computed(() => posts.value.length === 0)
  const visiblePosts = computed(() => posts.value.slice(0, MAX_RENDER))

  /** 从本地存储读取并整理顺序 */
  function load(): void {
    posts.value = sortByCreatedAtDesc(storage.read())
    statusMessage.value = ''
  }

  /** 新增动态：校验 → 置顶 → 写回存储 */
  function addPost(content: string): boolean {
    const result = validateContent(content)

    if (!result.ok) {
      statusMessage.value = result.reason === 'empty' ? MESSAGES.empty : MESSAGES.tooLong
      return false
    }

    const post = buildPost(result.trimmed, Date.now())
    posts.value = [post, ...posts.value]

    if (!storage.isAvailable) {
      statusMessage.value = MESSAGES.storageUnavailable
      return true
    }
    if (!storage.write(posts.value)) {
      statusMessage.value = MESSAGES.saveFailed
    } else {
      statusMessage.value = ''
    }
    return true
  }

  /** 删除单条动态并写回存储 */
  function removePost(id: string): void {
    const next = posts.value.filter((post) => post.id !== id)
    if (next.length === posts.value.length) return

    posts.value = next
    if (!storage.write(next)) {
      statusMessage.value = MESSAGES.saveFailed
    }
  }

  function clearStatus(): void {
    statusMessage.value = ''
  }

  return {
    posts,
    statusMessage,
    count,
    isEmpty,
    visiblePosts,
    load,
    addPost,
    removePost,
    clearStatus,
  }
})
