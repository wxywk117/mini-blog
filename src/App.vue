<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { usePostsStore } from '@/stores/posts'
import BackgroundLayers from '@/components/BackgroundLayers.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import ComposerBox from '@/components/ComposerBox.vue'
import PostList from '@/components/PostList.vue'

const store = usePostsStore()
const composer = ref<InstanceType<typeof ComposerBox> | null>(null)
let statusTimer: number | undefined

onMounted(() => {
  store.load()
})

function handleSubmit(content: string): void {
  if (store.addPost(content)) {
    composer.value?.reset()
  }
}

function handleDelete(id: string): void {
  store.removePost(id)
}

watch(
  () => store.statusMessage,
  (message) => {
    if (!message) return
    if (statusTimer !== undefined) window.clearTimeout(statusTimer)
    statusTimer = window.setTimeout(() => store.clearStatus(), 4000)
  }
)
</script>

<template>
  <BackgroundLayers />
  <AppTopbar :count="store.count" />

  <main id="main" class="mb-main">
    <ComposerBox ref="composer" :status-message="store.statusMessage" @submit="handleSubmit" />
    <PostList :posts="store.visiblePosts" @delete="handleDelete" />
  </main>

  <footer class="mb-footer">
    <p>数据仅保存在本地浏览器，清空浏览器数据将一并清除</p>
    <p class="mb-footer__version">小记 MiniBlog · v2.0.0</p>
  </footer>
</template>
