<template>
  <div id="empty-state" class="mb-empty">
    <span class="mb-empty__icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mbEmptyGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5B4BFF" stop-opacity="0.85" />
            <stop offset="1" stop-color="#8A5CFF" stop-opacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="9" y="15" width="46" height="33" rx="9" stroke="url(#mbEmptyGrad)" stroke-width="2" />
        <path d="M22 48v6l8-6" stroke="url(#mbEmptyGrad)" stroke-width="2" stroke-linejoin="round" />
        <path d="M21 27h22M21 35h13" stroke="url(#mbEmptyGrad)" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>
    <p class="mb-empty__title">还没有任何动态</p>
    <p class="mb-empty__desc">写下第一条记录，它只会保存在你的浏览器里</p>
  </div>
</template>
