<template>
  <audio
    ref="audioRef"
    :src="currentSrc"
    @loadedmetadata="onAudioLoaded"
    @timeupdate="onTimeUpdate"
    @ended="onSongEnded"
    @error="onAudioError"
    @play="onPlay"
    @pause="onPause"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { useMusicStore } from '@/stores/music'
import { getMusicResource } from '@/api/music'
import { showToast } from 'vant'

const audioRef = ref<HTMLAudioElement | null>(null)
const musicStore = useMusicStore()

const currentSrc = ref('')
const isSeeking = ref(false)

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

const play = () => {
  if (!audioRef.value) return
  audioRef.value.play().catch(() => {
    showToast({
      message: '播放失败，请检查音频链接',
      position: 'top'
    })
  })
}

const pause = () => {
  if (!audioRef.value) return
  audioRef.value.pause()
}

const load = () => {
  if (!audioRef.value) return
  audioRef.value.load()
}

const seekTo = (time: number) => {
  if (!audioRef.value) return
  audioRef.value.currentTime = time
}

const setVolume = (vol: number) => {
  if (!audioRef.value) return
  audioRef.value.volume = vol / 100
}

const getCurrentTime = () => {
  return audioRef.value?.currentTime || 0
}

const getDuration = () => {
  return audioRef.value?.duration || 0
}

const audioControl = {
  play,
  pause,
  load,
  seekTo,
  setVolume,
  getCurrentTime,
  getDuration
}

provide('audioControl', audioControl)

watch(() => musicStore.currentSong, () => {
  updateSrc()
}, { immediate: true })

watch(() => musicStore.isPlaying, (playing) => {
  if (playing) {
    play()
  } else {
    pause()
  }
})

watch(() => musicStore.currentTime, (time) => {
  if (audioRef.value && Math.abs(audioRef.value.currentTime - time) > 0.1) {
    isSeeking.value = true
    audioRef.value.currentTime = time
    setTimeout(() => {
      isSeeking.value = false
    }, 300)
  }
})

watch(() => musicStore.volume, (vol) => {
  setVolume(vol)
})

const onAudioLoaded = () => {
  if (audioRef.value) {
    musicStore.setDuration(audioRef.value.duration)
  }
}

const onTimeUpdate = () => {
  if (audioRef.value && !isSeeking.value) {
    musicStore.setCurrentTime(audioRef.value.currentTime)
  }
}

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

const onPlay = () => {
  musicStore.setIsPlaying(true)
}

const onPause = () => {
  musicStore.setIsPlaying(false)
}

const onAudioError = () => {
  musicStore.setIsPlaying(false)
  showToast({
    message: '音频加载失败',
    position: 'top'
  })
}

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