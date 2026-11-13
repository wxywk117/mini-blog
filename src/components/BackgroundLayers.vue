<template>
  <!-- 胶片背景栈：照片 → 暖色遮罩 → 颗粒 → 漏光 → 光斑与网格 -->
  <div class="mb-backdrop" aria-hidden="true">
    <span class="mb-backdrop__photo"></span>
    <span class="mb-backdrop__shade"></span>
    <span class="mb-backdrop__grain"></span>
    <span class="mb-backdrop__leak"></span>
    <span class="mb-blob mb-blob--one"></span>
    <span class="mb-blob mb-blob--two"></span>
    <span class="mb-blob mb-blob--three"></span>
    <span class="mb-grid"></span>
  </div>
</template>
