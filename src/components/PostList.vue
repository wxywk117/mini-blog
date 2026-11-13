<script setup lang="ts">
import PostCard from '@/components/PostCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Post } from '@/types/post'

const props = defineProps<{
  posts: Post[]
  /** 注入确认函数，默认使用原生 confirm，便于组件测试 */
  confirmFn?: (message: string) => boolean
}>()

const emit = defineEmits<{ (event: 'delete', id: string): void }>()

const CONFIRM_TEXT = '确定删除这条动态吗？删除后不可恢复。'

function requestDelete(id: string): void {
  const confirm = props.confirmFn ?? ((message: string) => window.confirm(message))
  if (!confirm(CONFIRM_TEXT)) return
  emit('delete', id)
}
</script>

<template>
  <section class="mb-feed" aria-labelledby="feed-title">
    <div class="mb-feed__head">
      <h2 id="feed-title" class="mb-feed__title">最新动态</h2>
      <span id="feed-summary" class="mb-feed__summary">共 {{ posts.length }} 条</span>
    </div>

    <ul class="mb-list">
      <PostCard v-for="post in posts" :key="post.id" :post="post" @delete="requestDelete" />
    </ul>

    <EmptyState v-if="posts.length === 0" />
  </section>
</template>
