<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MAX_LEN, WARN_LEN, charLength, formatCounter, validateContent } from '@/lib/text'
import { useAutoResize } from '@/composables/useAutoResize'

const props = withDefaults(defineProps<{ statusMessage?: string }>(), {
  statusMessage: '',
})

const emit = defineEmits<{ (event: 'submit', content: string): void }>()

const text = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const { resize } = useAutoResize(textarea)

const length = computed(() => charLength(text.value))
const validation = computed(() => validateContent(text.value))
const overLimit = computed(() => length.value > MAX_LEN)
const isWarning = computed(() => !overLimit.value && length.value >= WARN_LEN)
const canSubmit = computed(() => validation.value.ok)
const counterText = computed(() => formatCounter(length.value, MAX_LEN))

watch(text, () => resize())

function shake(): void {
  const element = button.value
  if (!element) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  element.classList.remove('is-shake')
  void element.offsetWidth
  element.classList.add('is-shake')
}

function submit(): void {
  if (!canSubmit.value) {
    shake()
    textarea.value?.focus()
    return
  }
  emit('submit', text.value)
}

function handleKeydown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}

function reset(): void {
  text.value = ''
  resize()
}

defineExpose({ reset })
</script>

<template>
  <section class="mb-composer" aria-labelledby="composer-title">
    <div class="mb-composer__head">
      <h1 id="composer-title" class="mb-composer__title">今天想说点什么？</h1>
      <p class="mb-composer__sub">内容只写入你自己的浏览器，不会上传</p>
    </div>

    <div class="mb-composer__body">
      <div class="mb-avatar" aria-hidden="true">我</div>
      <div class="mb-composer__field">
        <label class="mb-sr-only" for="composer-input">动态内容</label>
        <textarea
          id="composer-input"
          ref="textarea"
          v-model="text"
          class="mb-textarea"
          rows="2"
          placeholder="记录点什么…"
          aria-describedby="char-counter"
          autocomplete="off"
          @keydown="handleKeydown"
        ></textarea>
      </div>
    </div>

    <div class="mb-composer__foot">
      <div class="mb-hints">
        <span
          id="char-counter"
          class="mb-counter"
          :class="{ 'is-warning': isWarning, 'is-danger': overLimit }"
          aria-live="polite"
          >{{ counterText }}</span
        >
        <span class="mb-kbd-hint"><kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd> 快速发布</span>
      </div>
      <button
        id="publish-btn"
        ref="button"
        type="button"
        class="mb-btn mb-btn--primary"
        :disabled="!canSubmit"
        @click="submit"
      >
        发布
      </button>
    </div>

    <p id="status-message" class="mb-status" role="status" aria-live="polite">
      {{ props.statusMessage }}
    </p>
  </section>
</template>
