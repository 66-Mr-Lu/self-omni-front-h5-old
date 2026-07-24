import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MusicInfoResp } from '@/api/music'

// 播放模式类型
export type PlayMode = 'repeat' | 'shuffle' | 'single'

// 音乐播放状态管理
export const useMusicStore = defineStore('music', () => {
  // 当前播放的音乐
  const currentSong = ref<MusicInfoResp | null>(null)
  
  // 是否正在播放
  const isPlaying = ref(false)
  
  // 当前播放时间（秒）
  const currentTime = ref(0)
  
  // 音乐总时长（秒）
  const duration = ref(0)
  
  // 音量（0-100）
  const volume = ref(80)
  
  // 播放模式
  const playMode = ref<PlayMode>('repeat')
  
  // 播放列表
  const playlist = ref<MusicInfoResp[]>([])
  
  // 当前播放索引
  const currentIndex = ref(0)
  
  // 是否显示迷你播放器
  const showMiniPlayer = ref(false)

  // 进度百分比
  const progressPercent = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  // 设置当前播放音乐
  const setCurrentSong = (song: MusicInfoResp | null) => {
    currentSong.value = song
    showMiniPlayer.value = song !== null
  }

  // 设置播放状态
  const setIsPlaying = (playing: boolean) => {
    isPlaying.value = playing
  }

  // 设置当前播放时间
  const setCurrentTime = (time: number) => {
    currentTime.value = time
  }

  // 设置音乐总时长
  const setDuration = (time: number) => {
    duration.value = time
  }

  // 设置音量
  const setVolume = (vol: number) => {
    volume.value = Math.max(0, Math.min(100, vol))
  }

  // 设置播放模式
  const setPlayMode = (mode: PlayMode) => {
    playMode.value = mode
  }

  // 设置播放列表
  const setPlaylist = (list: MusicInfoResp[]) => {
    playlist.value = list
  }

  // 设置当前播放索引
  const setCurrentIndex = (index: number) => {
    currentIndex.value = index
  }

  // 设置迷你播放器显示状态
  const setShowMiniPlayer = (show: boolean) => {
    showMiniPlayer.value = show
  }

  // 播放下一首
  const playNext = () => {
    if (playlist.value.length === 0) return null
    
    if (playMode.value === 'shuffle') {
      currentIndex.value = Math.floor(Math.random() * playlist.value.length)
    } else if (playMode.value === 'single') {
      return playlist.value[currentIndex.value]
    } else {
      currentIndex.value = currentIndex.value === playlist.value.length - 1 
        ? 0 
        : currentIndex.value + 1
    }
    
    const nextSong = playlist.value[currentIndex.value]
    setCurrentSong(nextSong)
    return nextSong
  }

  // 播放上一首
  const playPrev = () => {
    if (playlist.value.length === 0) return null
    
    if (playMode.value === 'shuffle') {
      currentIndex.value = Math.floor(Math.random() * playlist.value.length)
    } else {
      currentIndex.value = currentIndex.value === 0 
        ? playlist.value.length - 1 
        : currentIndex.value - 1
    }
    
    const prevSong = playlist.value[currentIndex.value]
    setCurrentSong(prevSong)
    return prevSong
  }

  // 添加到播放列表
  const addToPlaylist = (song: MusicInfoResp) => {
    const exists = playlist.value.find(s => s.id === song.id)
    if (!exists) {
      playlist.value.push(song)
    }
  }

  // 从播放列表移除
  const removeFromPlaylist = (songId: number) => {
    const index = playlist.value.findIndex(s => s.id === songId)
    if (index !== -1) {
      playlist.value.splice(index, 1)
      if (currentIndex.value >= playlist.value.length) {
        currentIndex.value = Math.max(0, playlist.value.length - 1)
      }
    }
  }

  // 清空播放列表
  const clearPlaylist = () => {
    playlist.value = []
    currentIndex.value = 0
    setCurrentSong(null)
    showMiniPlayer.value = false
  }

  return {
    // 状态
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    playlist,
    currentIndex,
    showMiniPlayer,
    // 计算属性
    progressPercent,
    // 方法
    setCurrentSong,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setPlayMode,
    setPlaylist,
    setCurrentIndex,
    setShowMiniPlayer,
    playNext,
    playPrev,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist
  }
})