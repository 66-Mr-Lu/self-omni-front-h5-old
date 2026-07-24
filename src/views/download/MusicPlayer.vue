<template>
  <div class="music-player-page min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-md z-50">
      <div class="flex items-center px-4 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="collapsePlayer">
          <span class="text-white text-xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3 truncate flex-1">音乐播放</h1>
        <div class="playlist-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="togglePlaylist">
          <span class="text-white text-xl">☰</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content pt-12 pb-32">
      <!-- 加载中状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-[60vh]">
        <div class="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p class="text-white/60 text-sm mt-4">加载中...</p>
      </div>

      <template v-else-if="musicStore.currentSong">
        <!-- 封面图片区域 -->
        <div class="cover-section flex flex-col items-center justify-center py-12">
          <div class="cover-container relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
            <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span class="text-6xl">🎵</span>
            </div>
            <!-- 旋转动画（播放时） -->
            <div 
              class="absolute inset-0 bg-black/20"
              :class="{ 'animate-spin-slow': musicStore.isPlaying }"
            ></div>
          </div>
          
          <!-- 歌曲信息 -->
          <div class="song-info mt-8 text-center px-4">
            <h2 class="text-white text-xl font-bold truncate max-w-xs">{{ musicStore.currentSong.title }}</h2>
            <p class="text-white/60 text-sm mt-2 truncate max-w-xs">{{ musicStore.currentSong.artist }}</p>
            <p class="text-white/40 text-xs mt-1">{{ musicStore.currentSong.album }}</p>
          </div>

          <!-- 音频品质信息 -->
          <div class="quality-info mt-4 flex items-center gap-3 flex-wrap justify-center">
            <span 
              class="px-3 py-1 rounded-full text-xs"
              :class="getQualityClass(musicStore.currentSong.qualityLevel)"
            >
              {{ musicStore.currentSong.qualityLevel }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {{ musicStore.currentSong.codec }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {{ musicStore.currentSong.bitrate }}kbps
            </span>
            <span class="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {{ musicStore.currentSong.sampleRate }}Hz
            </span>
            <span v-if="musicStore.currentSong.bitDepth" class="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70">
              {{ musicStore.currentSong.bitDepth }}bit
            </span>
          </div>
        </div>

        <!-- 进度条区域 -->
        <div class="progress-section px-6">
          <div class="flex items-center">
            <span class="text-white/60 text-xs w-10 text-right">{{ formatTime(musicStore.currentTime) }}</span>
            <div 
              class="flex-1 h-1 bg-white/20 rounded-full mx-3 cursor-pointer relative"
              @click="seekTo"
              ref="progressBarRef"
            >
              <div 
                class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                :style="{ width: musicStore.progressPercent + '%' }"
              ></div>
              <div 
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all"
                :style="{ left: musicStore.progressPercent + '%', transform: 'translate(-50%, -50%)' }"
              ></div>
            </div>
            <span class="text-white/60 text-xs w-10">{{ formatTime(musicStore.duration) }}</span>
          </div>
        </div>

        <!-- 控制按钮区域 -->
        <div class="controls-section flex items-center justify-center gap-8 mt-10">
          <!-- 上一首 -->
          <div 
            class="control-btn w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            @click="prevSong"
          >
            <span class="text-white text-xl">⏮</span>
          </div>

          <!-- 播放/暂停 -->
          <div 
            class="play-btn w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-purple-500/50 transition-all cursor-pointer active:scale-95"
            @click="togglePlay"
          >
            <span v-if="!musicStore.isPlaying" class="text-white text-3xl">▶</span>
            <span v-else class="text-white text-3xl">⏸</span>
          </div>

          <!-- 下一首 -->
          <div 
            class="control-btn w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            @click="nextSong"
          >
            <span class="text-white text-xl">⏭</span>
          </div>
        </div>

        <!-- 音量控制 -->
        <div class="volume-section flex items-center justify-center gap-4 mt-8">
          <span class="text-white/60 text-lg">🔊</span>
          <div 
            class="w-32 h-1 bg-white/20 rounded-full cursor-pointer relative"
            @click="setVolume"
            ref="volumeBarRef"
          >
            <div 
              class="h-full bg-white/60 rounded-full transition-all"
              :style="{ width: musicStore.volume + '%' }"
            ></div>
          </div>
          <span class="text-white/60 text-xs w-8">{{ musicStore.volume }}%</span>
        </div>

        <!-- 播放模式 -->
        <div class="mode-section flex items-center justify-center gap-6 mt-6">
          <div 
            class="mode-btn flex flex-col items-center gap-1 cursor-pointer"
            :class="{ active: musicStore.playMode === 'repeat' }"
            @click="setMode('repeat')"
          >
            <span class="text-white/60 text-lg">🔁</span>
            <span class="text-white/40 text-xs">循环</span>
          </div>
          <div 
            class="mode-btn flex flex-col items-center gap-1 cursor-pointer"
            :class="{ active: musicStore.playMode === 'shuffle' }"
            @click="setMode('shuffle')"
          >
            <span class="text-white/60 text-lg">🔀</span>
            <span class="text-white/40 text-xs">随机</span>
          </div>
          <div 
            class="mode-btn flex flex-col items-center gap-1 cursor-pointer"
            :class="{ active: musicStore.playMode === 'single' }"
            @click="setMode('single')"
          >
            <span class="text-white/60 text-lg">🔂</span>
            <span class="text-white/40 text-xs">单曲</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 播放列表弹窗 -->
    <div 
      class="playlist-popup fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      :class="{ 'opacity-100': showPlaylist, 'opacity-0 pointer-events-none': !showPlaylist }"
      @click="togglePlaylist"
    >
      <div 
        class="playlist-container absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl max-h-[70vh] overflow-hidden transition-transform"
        :class="{ 'translate-y-0': showPlaylist, 'translate-y-full': !showPlaylist }"
        @click.stop
      >
        <div class="playlist-header flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <h3 class="text-white font-semibold">播放列表</h3>
          <span class="text-white/60 text-sm">{{ musicStore.playlist.length }} 首</span>
        </div>
        <div class="playlist-content overflow-y-auto max-h-[calc(70vh-60px)]">
          <div 
            v-for="(song, index) in musicStore.playlist" 
            :key="song.id"
            class="playlist-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            :class="{ 'bg-purple-500/20': musicStore.currentIndex === index }"
            @click="playSong(index)"
          >
            <span class="text-white/40 text-sm w-6">{{ index + 1 }}</span>
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span v-if="musicStore.currentIndex === index && musicStore.isPlaying" class="text-white text-sm animate-pulse">🎵</span>
              <span v-else class="text-white text-sm">🎶</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ song.title }}</p>
              <p class="text-white/40 text-xs truncate">{{ song.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 音频元素 -->
    <audio
      ref="audioRef"
      :src="currentAudioUrl"
      @loadedmetadata="onAudioLoaded"
      @timeupdate="onTimeUpdate"
      @ended="onSongEnded"
      @error="onAudioError"
      @play="onPlay"
      @pause="onPause"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getMusicDetail } from '@/api/music'
import { useMusicStore, type PlayMode } from '@/stores/music'

// 路由
const router = useRouter()
const route = useRoute()

// 音频引用
const audioRef = ref<HTMLAudioElement | null>(null)

// 进度条引用
const progressBarRef = ref<HTMLDivElement | null>(null)

// 音量条引用
const volumeBarRef = ref<HTMLDivElement | null>(null)

// 播放列表弹窗
const showPlaylist = ref(false)

// 加载状态
const loading = ref(false)

// 使用音乐 store
const musicStore = useMusicStore()

// 当前音频URL（后续替换为真实API）
const currentAudioUrl = computed(() => {
  return musicStore.currentSong?.audioUrl || ''
})

// 返回上一页（收起播放器，保留迷你播放器）
const collapsePlayer = () => {
  router.push('/resource/music-list')
}

// 获取品质等级样式
const getQualityClass = (qualityLevel: string): string => {
  const classMap: Record<string, string> = {
    '标准': 'bg-gray-500/30 text-gray-300',
    '高清': 'bg-blue-500/30 text-blue-300',
    '无损': 'bg-green-500/30 text-green-300',
    '母带': 'bg-purple-500/30 text-purple-300'
  }
  return classMap[qualityLevel] || 'bg-gray-500/30 text-gray-300'
}

// 格式化时间
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// 播放/暂停切换
const togglePlay = () => {
  if (!audioRef.value) return
  
  if (!musicStore.isPlaying) {
    audioRef.value.play().catch(() => {
      showToast({
        message: '播放失败，请检查音频链接',
        position: 'top'
      })
    })
  } else {
    audioRef.value.pause()
  }
}

// 播放指定歌曲
const playSong = (index: number) => {
  musicStore.setCurrentIndex(index)
  const song = musicStore.playlist[index]
  musicStore.setCurrentSong(song)
  showPlaylist.value = false
  
  if (audioRef.value) {
    audioRef.value.load()
    audioRef.value.play().catch(() => {
      showToast({
        message: '播放失败，请检查音频链接',
        position: 'top'
      })
    })
  }
}

// 上一首
const prevSong = () => {
  const prev = musicStore.playPrev()
  if (prev && audioRef.value) {
    audioRef.value.load()
    audioRef.value.play().catch(() => {
      showToast({
        message: '播放失败，请检查音频链接',
        position: 'top'
      })
    })
  }
}

// 下一首
const nextSong = () => {
  const next = musicStore.playNext()
  if (next && audioRef.value) {
    audioRef.value.load()
    audioRef.value.play().catch(() => {
      showToast({
        message: '播放失败，请检查音频链接',
        position: 'top'
      })
    })
  }
}

// 设置播放模式
const setMode = (mode: PlayMode) => {
  musicStore.setPlayMode(mode)
  
  const modeNames: Record<string, string> = {
    repeat: '列表循环',
    shuffle: '随机播放',
    single: '单曲循环'
  }
  
  showToast({
    message: modeNames[mode],
    position: 'top'
  })
}

// 跳转进度
const seekTo = (event: MouseEvent) => {
  if (!progressBarRef.value || !audioRef.value) return
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * musicStore.duration
  
  musicStore.setCurrentTime(time)
  audioRef.value.currentTime = time
}

// 设置音量
const setVolume = (event: MouseEvent) => {
  if (!volumeBarRef.value || !audioRef.value) return
  
  const rect = volumeBarRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newVolume = Math.max(0, Math.min(100, percent * 100))
  
  musicStore.setVolume(newVolume)
  audioRef.value.volume = newVolume / 100
}

// 切换播放列表显示
const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

// 获取音乐详情
const fetchMusicDetail = async () => {
  const musicId = Number(route.params.id)
  
  if (!musicId) {
    showToast({
      message: '音乐ID无效',
      position: 'top'
    })
    return
  }

  try {
    loading.value = true
    const detail = await getMusicDetail(musicId)
    
    // 更新当前歌曲信息
    musicStore.setCurrentSong(detail)
    
    // 添加到播放列表（如果不存在）
    musicStore.addToPlaylist(detail)
    
    // 设置当前索引
    const index = musicStore.playlist.findIndex(s => s.id === detail.id)
    if (index !== -1) {
      musicStore.setCurrentIndex(index)
    }
    
    // 设置默认音量
    if (audioRef.value) {
      audioRef.value.volume = musicStore.volume / 100
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '获取音乐详情失败',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// 音频加载完成
const onAudioLoaded = () => {
  if (audioRef.value) {
    musicStore.setDuration(audioRef.value.duration)
  }
}

// 播放时间更新
const onTimeUpdate = () => {
  if (audioRef.value) {
    musicStore.setCurrentTime(audioRef.value.currentTime)
  }
}

// 歌曲播放结束
const onSongEnded = () => {
  musicStore.setIsPlaying(false)
  
  // 根据播放模式决定下一首
  if (musicStore.playMode === 'single') {
    // 单曲循环，重新播放
    if (audioRef.value) {
      audioRef.value.load()
      audioRef.value.play()
    }
  } else {
    // 列表循环或随机播放，播放下一首
    nextSong()
  }
}

// 播放开始
const onPlay = () => {
  musicStore.setIsPlaying(true)
}

// 播放暂停
const onPause = () => {
  musicStore.setIsPlaying(false)
}

// 音频加载错误
const onAudioError = () => {
  musicStore.setIsPlaying(false)
  showToast({
    message: '音频加载失败',
    position: 'top'
  })
}

// 页面加载
onMounted(() => {
  fetchMusicDetail()
})

// 页面卸载
onUnmounted(() => {
  // 保持播放状态，不停止音频
})
</script>

<style scoped>
.music-player-page {
  min-height: 100vh;
}

.back-btn:active,
.playlist-btn:active {
  opacity: 0.7;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-container {
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.3);
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.control-btn:active {
  transform: scale(0.95);
}

.play-btn:active {
  transform: scale(0.95);
}

.mode-btn.active span:first-child {
  color: #a855f7;
}

.playlist-item:active {
  background-color: rgba(168, 85, 247, 0.3) !important;
}

.playlist-content::-webkit-scrollbar {
  width: 4px;
}

.playlist-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
</style>