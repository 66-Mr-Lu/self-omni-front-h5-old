<template>
  <div class="video-info-card bg-white rounded-xl shadow-sm p-4">
    <div class="flex gap-3">
      <!-- 封面图 -->
      <div class="cover-wrapper w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          :src="video.coverUrl" 
          :alt="video.title" 
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
      </div>
      <!-- 视频信息 -->
      <div class="flex-1 min-w-0">
        <h3 class="text-gray-800 font-medium text-sm line-clamp-2">{{ video.title }}</h3>
        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>{{ video.upName }}</span>
          <span>{{ video.viewCount }}播放</span>
        </div>
        <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span>时长：{{ video.duration }}</span>
          <span>{{ video.danmakuCount }}弹幕</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VideoInfo } from '@/stores/download'

// 定义 props
defineProps<{
  video: VideoInfo
}>()

// 处理图片加载失败
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23f0f0f0" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E视频封面%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
