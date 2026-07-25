<template>
  <!-- 音频播放引擎（始终存在，只要有当前歌曲） -->
  <audio
    v-if="musicStore.currentSong"
    ref="audioRef"
    :src="currentSrc"
    @loadedmetadata="onAudioLoaded"
    @timeupdate="onTimeUpdate"
    @ended="onSongEnded"
    @error="onAudioError"
    @play="onPlay"
    @pause="onPause"
  />

  <!-- 迷你播放器可视化UI（不在播放页面时显示） -->
  <div 
    v-if="showMiniPlayerBar"
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
        <h4 class="text-white text-sm truncate">{{ musicStore.currentSong?.title }}</h4>
        <p class="text-white/50 text-xs truncate">{{ musicStore.currentSong?.artist }}</p>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { getMusicResource } from '@/api/music'
import { showToast } from 'vant'

// 路由
const router = useRouter()
const route = useRoute()

// 使用音乐 store
const musicStore = useMusicStore()

// 音频引用
const audioRef = ref<HTMLAudioElement | null>(null)
const currentSrc = ref('')
const isSeeking = ref(false)

// 是否在播放页面
const isOnPlayerPage = computed(() => {
  return route.path.startsWith('/resource/music-player/')
})

// 是否显示迷你播放器（有当前歌曲、不在播放页面、且显示开关为true）
const showMiniPlayerBar = computed(() => {
  return musicStore.showMiniPlayer && musicStore.currentSong && !isOnPlayerPage.value
})

// 更新音频源
const updateSrc = () => {
  if (musicStore.currentSong) {
    const audioUrl = getMusicResource(musicStore.currentSong.id, 'audio')
    if (currentSrc.value !== audioUrl) {
      currentSrc.value = audioUrl
    }
  } else {
    currentSrc.value = ''
  }
}

// 播放
const play = () => {
  if (!audioRef.value) return
  audioRef.value.play().catch(() => {
    showToast({
      message: '播放失败，请检查音频链接',
      position: 'top'
    })
  })
}

// 暂停
const pause = () => {
  if (!audioRef.value) return
  audioRef.value.pause()
}

// 加载
const load = () => {
  if (!audioRef.value) return
  audioRef.value.load()
}

// 设置音量
const setVolume = (vol: number) => {
  if (!audioRef.value) return
  audioRef.value.volume = vol / 100
}

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
  const prev = musicStore.playPrev()
  if (prev) {
    setTimeout(() => {
      musicStore.setIsPlaying(true)
    }, 100)
  }
}

// 下一首
const nextSong = () => {
  const next = musicStore.playNext()
  if (next) {
    setTimeout(() => {
      musicStore.setIsPlaying(true)
    }, 100)
  }
}

// 点击进度条跳转
const seekTo = (event: MouseEvent) => {
  if (musicStore.duration === 0) return
  
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * musicStore.duration
  musicStore.setCurrentTime(time)
}

// 关闭迷你播放器（完全销毁）
const closeMiniPlayer = () => {
  musicStore.setIsPlaying(false)
  musicStore.setCurrentSong(null)
  musicStore.setCurrentTime(0)
  musicStore.setDuration(0)
  musicStore.setShowMiniPlayer(false)
}

// 音频加载完成
const onAudioLoaded = () => {
  if (audioRef.value) {
    musicStore.setDuration(audioRef.value.duration)
  }
}

// 时间更新
const onTimeUpdate = () => {
  if (audioRef.value && !isSeeking.value) {
    musicStore.setCurrentTime(audioRef.value.currentTime)
  }
}

// 歌曲播放结束
const onSongEnded = () => {
  musicStore.setIsPlaying(false)
  
  if (musicStore.playMode === 'single') {
    if (audioRef.value) {
      audioRef.value.load()
      audioRef.value.play()
    }
  } else {
    const nextSong = musicStore.playNext()
    if (nextSong) {
      setTimeout(() => {
        load()
        play()
      }, 100)
    }
  }
}

// 播放事件
const onPlay = () => {
  musicStore.setIsPlaying(true)
}

// 暂停事件
const onPause = () => {
  musicStore.setIsPlaying(false)
}

// 音频错误
const onAudioError = () => {
  musicStore.setIsPlaying(false)
  showToast({
    message: '音频加载失败',
    position: 'top'
  })
}

// 监听当前歌曲变化，更新音频源
watch(() => musicStore.currentSong, () => {
  updateSrc()
}, { immediate: true })

// 监听播放状态变化
watch(() => musicStore.isPlaying, (playing) => {
  if (playing) {
    play()
  } else {
    pause()
  }
})

// 监听当前时间变化（拖动进度条）
watch(() => musicStore.currentTime, (time) => {
  if (audioRef.value && Math.abs(audioRef.value.currentTime - time) > 0.1) {
    isSeeking.value = true
    audioRef.value.currentTime = time
    setTimeout(() => {
      isSeeking.value = false
    }, 300)
  }
})

// 监听音量变化
watch(() => musicStore.volume, (vol) => {
  setVolume(vol)
})

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = musicStore.volume / 100
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
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