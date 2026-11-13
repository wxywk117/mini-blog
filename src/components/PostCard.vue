<script setup lang="ts">
import { computed } from 'vue'
import { formatAbsoluteTime, formatRelativeTime } from '@/lib/time'
import { useRelativeTime } from '@/composables/useRelativeTime'
import type { Post } from '@/types/post'

const props = defineProps<{ post: Post }>()
const emit = defineEmits<{ (event: 'delete', id: string): void }>()

const { now } = useRelativeTime()

const relativeTime = computed(() => formatRelativeTime(props.post.createdAt, now.value))
const absoluteTime = computed(() => formatAbsoluteTime(props.post.createdAt))
const isoTime = computed(() => new Date(props.post.createdAt).toISOString())
const initial = computed(() => props.post.author.slice(0, 1) || '我')
</script>

<template>
  <li class="mb-post" :data-id="post.id">
    <div class="mb-post__head">
      <span class="mb-post__avatar" aria-hidden="true">{{ initial }}</span>
      <div class="mb-post__meta">
        <span class="mb-post__author">{{ post.author }}</span>
        <time
          class="mb-post__time"
          :datetime="isoTime"
          :data-ts="post.createdAt"
          :title="absoluteTime"
          >{{ relativeTime }}</time
        >
      </div>
    </div>

    <p class="mb-post__body">{{ post.content }}</p>

    <div class="mb-post__foot">
      <button
        type="button"
        class="mb-icon-btn"
        data-action="delete"
        aria-label="删除这条动态"
        title="删除这条动态"
        @click="emit('delete', post.id)"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 7h14M10 7V5.6A1.6 1.6 0 0 1 11.6 4h.8A1.6 1.6 0 0 1 14 5.6V7m-7 0 .8 11.1A1.9 1.9 0 0 0 9.7 20h4.6a1.9 1.9 0 0 0 1.9-1.9L17 7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>删除</span>
      </button>
    </div>
  </li>
</template>
