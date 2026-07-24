<template>
  <div 
    v-if="musicStore.showMiniPlayer && musicStore.currentSong"
    class="mini-player fixed bottom-11 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 px-4 py-2"
    @click="expandPlayer"
  >
    <div class="flex items-center gap-3">
      <!-- 封面 -->
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
        <span class="text-lg">🎵</span>
      </div>
      
      <!-- 歌曲信息 -->
      <div class="flex-1 min-w-0">
        <h4 class="text-white text-sm truncate">{{ musicStore.currentSong.title }}</h4>
        <p class="text-white/50 text-xs truncate">{{ musicStore.currentSong.artist }}</p>
      </div>
      
      <!-- 进度条 -->
      <div class="w-16 h-1 bg-white/20 rounded-full cursor-pointer relative" @click.stop="seekTo">
        <div 
          class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          :style="{ width: musicStore.progressPercent + '%' }"
        ></div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="flex items-center gap-2">
        <div 
          class="w-7 h-7 flex items-center justify-center cursor-pointer"
          @click.stop="prevSong"
        >
          <span class="text-white text-sm">⏮</span>
        </div>
        <div 
          class="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer"
          @click.stop="togglePlay"
        >
          <span v-if="!musicStore.isPlaying" class="text-white text-base">▶</span>
          <span v-else class="text-white text-base">⏸</span>
        </div>
        <div 
          class="w-7 h-7 flex items-center justify-center cursor-pointer"
          @click.stop="nextSong"
        >
          <span class="text-white text-sm">⏭</span>
        </div>
      </div>
      
      <!-- 关闭按钮 -->
      <div 
        class="close-btn w-7 h-7 flex items-center justify-center cursor-pointer text-white/60 hover:text-white"
        @click.stop="closeMiniPlayer"
      >
        <span class="text-sm">✕</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'

// 路由
const router = useRouter()

// 使用音乐 store
const musicStore = useMusicStore()

// 展开到完整播放器页面
const expandPlayer = () => {
  if (musicStore.currentSong) {
    router.push(`/resource/music-player/${musicStore.currentSong.id}`)
  }
}

// 播放/暂停
const togglePlay = () => {
  musicStore.setIsPlaying(!musicStore.isPlaying)
}

// 上一首
const prevSong = () => {
  musicStore.playPrev()
}

// 下一首
const nextSong = () => {
  musicStore.playNext()
}

// 跳转进度
const seekTo = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * musicStore.duration
  musicStore.setCurrentTime(time)
}

// 关闭迷你播放器
const closeMiniPlayer = () => {
  musicStore.setIsPlaying(false)
  musicStore.setShowMiniPlayer(false)
}
</script>

<style scoped>
.mini-player:active {
  opacity: 0.9;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>