<template>
  <div class="music-player-page h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
    <!-- 顶部返回按钮（悬浮） -->
    <div class="back-button absolute top-0 left-0 z-50">
      <div class="w-10 h-10 flex items-center justify-center cursor-pointer" @click="collapsePlayer">
        <span class="text-white text-3xl">‹</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content px-4 h-[calc(100vh-44px)] flex flex-col">
      <!-- 加载中状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-[60vh] flex-1">
        <div class="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p class="text-white/60 text-sm mt-4">加载中...</p>
      </div>

      <template v-else-if="musicStore.currentSong">
        <!-- 上方可变内容区域（flex-1 填充剩余空间，歌词模式下使用 flex 列布局） -->
        <div class="flex-1 overflow-hidden" :class="{ 'flex flex-col': isLyricMode }">
          <!-- 歌词模式 -->
          <template v-if="isLyricMode">
            <!-- 歌曲信息区域 -->
            <div class="info-section mt-1">
              <!-- 第一行：歌名 -->
              <div class="title-row w-full text-center">
                <h2 class="text-white text-lg font-semibold">{{ musicStore.currentSong.title }}</h2>
              </div>

              <!-- 第二行：歌手 -->
              <div class="meta-row mt-1 text-center">
                <span class="text-white/50 text-xs">{{ musicStore.currentSong.artist }}</span>
              </div>
            </div>

            <!-- 滚动歌词区域（单击返回播放页面，双击歌词跳转到对应时间） -->
            <div 
              class="lyrics-wrapper relative flex-1 min-h-0 overflow-hidden"
              @click="handleLyricClick"
            >
              <!-- 顶部渐变遮罩 -->
              <div class="lyrics-mask-top absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"></div>
              
              <!-- 底部渐变遮罩 -->
              <div class="lyrics-mask-bottom absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"></div>

              <!-- 歌词列表 -->
              <div 
                class="lyrics-container overflow-y-auto h-full"
                ref="lyricsContainerRef"
              >
                <!-- 顶部 spacer：使首行歌词能滚动到中间位置 -->
                <div class="lyrics-spacer-top"></div>
                
                <div
                  v-for="(line, index) in lyrics"
                  :key="index"
                  class="lyric-line py-4 px-6 text-center transition-all duration-300"
                  :class="{
                    'current-lyric': index === currentLyricIndex,
                    'normal-lyric': index !== currentLyricIndex
                  }"
                  @click.stop="handleLyricClick"
                  @dblclick="handleLyricDblClick(line.time)"
                >
                  {{ line.text }}
                </div>

                <!-- 底部 spacer：使末行歌词能滚动到中间位置 -->
                <div class="lyrics-spacer-bottom"></div>

                <!-- 暂无歌词提示 -->
                <div v-if="!hasLyrics" class="flex flex-col items-center justify-center py-20">
                  <p class="text-white/40 text-sm">暂无歌词</p>
                </div>
              </div>
            </div>
          </template>

          <!-- 播放模式 -->
          <template v-else>
            <!-- 封面和歌曲信息区域 -->
            <div>
              <!-- 封面图片区域 -->
              <div class="cover-section mt-12 flex flex-col items-center justify-center py-6">
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
              </div>

              <!-- 歌曲信息区域（前三行） -->
              <div class="info-section mt-16">
                <!-- 第一行：标题，占60%宽度，支持滚动 -->
                <div class="title-row w-[60%] overflow-x-auto scrollbar-hide">
                  <h2 class="text-white text-xl font-bold whitespace-nowrap">{{ musicStore.currentSong.title }}</h2>
                </div>

                <!-- 第二行：歌手、品质、比特率 -->
                <div class="meta-row mt-1.5 flex items-center gap-3">
                  <span class="text-white/60 text-sm">{{ musicStore.currentSong.artist }}</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs"
                    :class="getQualityClass(musicStore.currentSong.qualityLevel)"
                  >
                    {{ musicStore.currentSong.qualityLevel }}
                  </span>
                  <span class="text-white/40 text-xs">{{ musicStore.currentSong.bitrate }}kbps</span>
                </div>

                <!-- 第三行：歌词（只显示一行），点击切换到歌词模式 -->
                <div class="lyrics-row mt-2 cursor-pointer" @click="toggleLyricMode">
                  <p class="text-white/50 text-sm">
                    {{ currentLyricText || '暂无歌词' }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 底部固定区域（flex-shrink-0 不被压缩） -->
        <div class="flex-shrink-0 pb-8">
          <!-- 第四行：进度条（两种模式共用） -->
          <div class="progress-row mt-4">
            <div 
              class="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
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
            <div class="flex justify-between mt-1">
              <span class="text-white/60 text-xs">{{ formatTime(musicStore.currentTime) }}</span>
              <span class="text-white/60 text-xs">{{ formatTime(musicStore.duration) }}</span>
            </div>
          </div>

          <!-- 第五行：控制按钮（两种模式共用） -->
          <div class="controls-row mt-2 flex items-center justify-between">
            <!-- 播放模式（循环切换） -->
            <div 
              class="mode-btn w-10 h-10 flex items-center justify-center cursor-pointer"
              @click="cyclePlayMode"
            >
              <span class="text-white/70 text-xl">{{ playModeIcon }}</span>
            </div>

            <!-- 播放控制组（上一首、播放、下一首），整体居中 -->
            <div class="play-controls flex items-center gap-6">
              <!-- 上一首 -->
              <div 
                class="control-btn w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                @click="prevSong"
              >
                <span class="text-white text-xl">⏮</span>
              </div>

              <!-- 播放/暂停 -->
              <div 
                class="play-btn w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-purple-500/50 transition-all cursor-pointer active:scale-95"
                @click="togglePlay"
              >
                <span v-if="!musicStore.isPlaying" class="text-white text-2xl">▶</span>
                <span v-else class="text-white text-2xl">⏸</span>
              </div>

              <!-- 下一首 -->
              <div 
                class="control-btn w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                @click="nextSong"
              >
                <span class="text-white text-xl">⏭</span>
              </div>
            </div>

            <!-- 更多按钮 -->
            <div 
              class="more-btn w-10 h-10 flex items-center justify-center cursor-pointer"
              @click="togglePlaylist"
            >
              <span class="text-white/70 text-xl">☰</span>
            </div>
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getMusicDetail, getMusicResource } from '@/api/music'
import { useMusicStore, type PlayMode } from '@/stores/music'

const router = useRouter()
const route = useRoute()

const progressBarRef = ref<HTMLDivElement | null>(null)
const lyricsContainerRef = ref<HTMLDivElement | null>(null)
const showPlaylist = ref(false)
const loading = ref(false)
const isLyricMode = ref(false)
const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 是否需要自动播放（从音乐列表点击进入时为true，从迷你播放器进入时为false）
const shouldAutoPlay = computed(() => {
  return route.query.autoPlay === 'true'
})

const musicStore = useMusicStore()

// 歌词相关
interface LyricLine {
  time: number
  text: string
}

const lyrics = ref<LyricLine[]>([])
const hasLyrics = ref(false)

// 解析 LRC 格式歌词
const parseLrc = (lrcText: string): LyricLine[] => {
  const lines = lrcText.split('\n')
  const result: LyricLine[] = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
  
  lines.forEach(line => {
    const matches = line.match(timeRegex)
    if (matches) {
      const minutes = parseInt(matches[1])
      const seconds = parseInt(matches[2])
      const milliseconds = parseInt(matches[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(timeRegex, '').trim()
      if (text) {
        result.push({ time, text })
      }
    }
  })
  
  return result.sort((a, b) => a.time - b.time)
}

// 获取当前歌词索引
const currentLyricIndex = computed(() => {
  const currentTime = musicStore.currentTime
  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics.value[i].time) {
      return i
    }
  }
  return -1
})

// 当前歌词文本（只显示一行）
const currentLyricText = computed(() => {
  if (currentLyricIndex.value >= 0 && lyrics.value[currentLyricIndex.value]) {
    return lyrics.value[currentLyricIndex.value].text
  }
  return ''
})

// 播放模式图标
const playModeIcon = computed(() => {
  const iconMap: Record<string, string> = {
    repeat: '🔁',
    shuffle: '🔀',
    single: '🔂'
  }
  return iconMap[musicStore.playMode] || '🔁'
})

// 循环切换播放模式
const cyclePlayMode = () => {
  const modes: PlayMode[] = ['repeat', 'shuffle', 'single']
  const currentIndex = modes.indexOf(musicStore.playMode)
  const nextIndex = (currentIndex + 1) % modes.length
  const nextMode = modes[nextIndex]
  
  musicStore.setPlayMode(nextMode)
  
  const modeNames: Record<string, string> = {
    repeat: '列表循环',
    shuffle: '随机播放',
    single: '单曲循环'
  }
  
  showToast({
    message: modeNames[nextMode],
    position: 'top'
  })
}

// 获取歌词资源
const fetchLyrics = async (songId: number) => {
  try {
    const lyricUrl = getMusicResource(songId, 'lyric')
    const response = await fetch(lyricUrl)
    
    if (!response.ok) {
      hasLyrics.value = false
      return
    }
    
    const lrcText = await response.text()
    if (!lrcText.trim()) {
      hasLyrics.value = false
      return
    }
    
    lyrics.value = parseLrc(lrcText)
    hasLyrics.value = lyrics.value.length > 0
  } catch {
    hasLyrics.value = false
  }
}

// 歌词自动滚动
const scrollToCurrentLyric = () => {
  if (!lyricsContainerRef.value || currentLyricIndex.value < 0) return
  
  const lyricElement = lyricsContainerRef.value.children[currentLyricIndex.value] as HTMLElement
  if (!lyricElement) return
  
  lyricElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

// 监听当前歌曲变化，重新获取歌词
watch(() => musicStore.currentSong, async (newSong) => {
  if (newSong) {
    lyrics.value = []
    hasLyrics.value = false
    await fetchLyrics(newSong.id)
  }
})

// 监听歌词索引变化，触发滚动
watch(currentLyricIndex, () => {
  scrollToCurrentLyric()
})

// 返回上一页（收起播放器，保留迷你播放器）
const collapsePlayer = () => {
  router.back()
}

// 切换歌词模式
const toggleLyricMode = () => {
  isLyricMode.value = !isLyricMode.value
  if (isLyricMode.value) {
    nextTick(() => {
      scrollToCurrentLyric()
    })
  }
}

// 跳转到指定歌词时间
const seekToLyric = (time: number) => {
  musicStore.setCurrentTime(time)
}

// 处理歌词区域单击事件（延迟返回）
const handleLyricClick = () => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
  }
  clickTimer.value = setTimeout(() => {
    toggleLyricMode()
    clickTimer.value = null
  }, 250)
}

// 处理歌词双击事件（取消延迟，跳转播放位置）
const handleLyricDblClick = (time: number) => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
    clickTimer.value = null
  }
  seekToLyric(time)
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
  musicStore.setIsPlaying(!musicStore.isPlaying)
}

// 播放指定歌曲
const playSong = (index: number) => {
  musicStore.setCurrentIndex(index)
  const song = musicStore.playlist[index]
  musicStore.setCurrentSong(song)
  showPlaylist.value = false
  setTimeout(() => {
    musicStore.setIsPlaying(true)
  }, 100)
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

// 跳转进度
const seekTo = (event: MouseEvent) => {
  if (!progressBarRef.value || musicStore.duration === 0) return
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * musicStore.duration
  
  musicStore.setCurrentTime(time)
}

// 切换播放列表显示
const togglePlaylist = () => {
  // showPlaylist.value = !showPlaylist.value
  showToast({
    message: '播放列表功能开发中',
    position: 'top'
  })
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
    
    // 设置时长（优先使用后台返回的时长）
    if (detail.duration) {
      musicStore.setDuration(detail.duration)
    }
    
    // 添加到播放列表（如果不存在）
    musicStore.addToPlaylist(detail)
    
    // 设置当前索引
    const index = musicStore.playlist.findIndex(s => s.id === detail.id)
    if (index !== -1) {
      musicStore.setCurrentIndex(index)
    }
    
    // 歌词获取由 watch musicStore.currentSong 统一处理，避免重复请求
    
    // 只有从音乐列表点击进入时才自动播放（从迷你播放器进入时保持原播放状态）
    if (shouldAutoPlay.value) {
      musicStore.setIsPlaying(false)
      setTimeout(() => {
        musicStore.setIsPlaying(true)
      }, 300)
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

// 页面加载
onMounted(() => {
  fetchMusicDetail()
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

.mode-btn:active,
.more-btn:active {
  opacity: 0.7;
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

.title-row::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.lyrics-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lyrics-container {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.lyrics-container::-webkit-scrollbar {
  display: none;
}

.lyrics-spacer-top,
.lyrics-spacer-bottom {
  height: 50vh;
}

.lyrics-mask-top {
  background: linear-gradient(to bottom, rgba(88, 28, 135, 0.8) 0%, rgba(88, 28, 135, 0.4) 50%, transparent 100%);
}

.lyrics-mask-bottom {
  background: linear-gradient(to top, rgba(88, 28, 135, 0.8) 0%, rgba(88, 28, 135, 0.4) 50%, transparent 100%);
}

.current-lyric {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  transform: scale(1.1);
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4);
  letter-spacing: 1px;
}

.normal-lyric {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  transform: scale(1);
}

.lyric-line:active {
  opacity: 0.7;
}

.back-to-player-area:active {
  opacity: 0.7;
}
</style>