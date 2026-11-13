<script setup lang="ts">
import { useTopbarScroll } from '@/composables/useTopbarScroll'

defineProps<{ count: number }>()

const { scrolled } = useTopbarScroll()
</script>

<template>
  <header id="topbar" class="mb-topbar" :class="{ 'is-scrolled': scrolled }">
    <div class="mb-topbar__inner">
      <a class="mb-brand" href="#main" aria-label="小记 MiniBlog 首页">
        <span class="mb-brand__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.2 5.6h13.6a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2h-6.1l-4.4 3.2a.7.7 0 0 1-1.1-.57V17.1H5.2A2.2 2.2 0 0 1 3 14.9V7.8a2.2 2.2 0 0 1 2.2-2.2Z"
              fill="currentColor"
              opacity="0.92"
            />
            <circle cx="8.6" cy="11" r="1.15" fill="#fff" />
            <circle cx="12.2" cy="11" r="1.15" fill="#fff" />
            <circle cx="15.8" cy="11" r="1.15" fill="#fff" />
          </svg>
        </span>
        <span class="mb-brand__text">
          <span class="mb-brand__name">小记 <em>MiniBlog</em></span>
          <span class="mb-brand__slogan">记录此刻，只属于你</span>
        </span>
      </a>

      <div class="mb-topbar__meta">
        <span v-if="count > 0" id="post-count" class="mb-badge">{{ count }} 条动态</span>
        <span class="mb-local-tag">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3.6 5 6.6v5.1c0 4.2 2.9 7.6 7 8.7 4.1-1.1 7-4.5 7-8.7V6.6l-7-3Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path
              d="M9.2 11.8l2 2 3.6-3.9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          本地存储
        </span>
      </div>
    </div>
  </header>
</template>
