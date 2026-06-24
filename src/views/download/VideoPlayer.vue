<template>
  <div class="video-player-page min-h-screen bg-black">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-black/80 z-50">
      <div class="flex items-center px-4 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3 truncate flex-1">{{ videoInfo?.title || '视频播放' }}</h1>
      </div>
    </div>

    <!-- 视频播放区域 -->
    <div class="video-container pt-12">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-state flex flex-col items-center justify-center h-[60vh]">
        <div class="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p class="text-white/60 text-sm mt-4">加载中...</p>
      </div>

      <!-- 未下载视频提示 -->
      <div v-else-if="videoInfo?.isDownload === 'N'" class="not-downloaded flex flex-col items-center justify-center h-[60vh]">
        <div class="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
          <span class="text-4xl">📺</span>
        </div>
        <h2 class="text-white text-xl font-semibold mb-2">该视频未下载</h2>
        <p class="text-white/60 text-sm mb-6">点击下方按钮跳转到B站APP播放</p>
        <button
          class="px-8 py-3 bg-primary text-white rounded-lg font-medium transition-all active:opacity-80"
          @click="openInBilibili"
        >
          跳转到B站
        </button>
      </div>

      <!-- 已下载视频播放 -->
      <div v-else-if="videoInfo?.isDownload === 'Y'" class="video-wrapper">
        <!-- 等待资源加载 -->
        <div v-if="!actualVideoUrl" class="loading-state flex flex-col items-center justify-center h-[60vh]">
          <div class="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p class="text-white/60 text-sm mt-4">获取播放资源中...</p>
        </div>
        <!-- 视频播放 -->
        <div v-else class="video-audio-wrapper">
          <video
            ref="videoRef"
            class="w-full bg-black"
            controls
            playsinline
            crossorigin="anonymous"
            :src="actualVideoUrl"
            type="video/mp4"
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
            @canplay="onVideoCanPlay"
            @canplaythrough="onVideoCanPlayThrough"
            @loadeddata="onVideoLoadedData"
            @waiting="onVideoWaiting"
            @stalled="onVideoStalled"
            @play="syncAudioPlay"
            @pause="syncAudioPause"
            @timeupdate="syncAudioTime"
            @seeked="syncAudioTime"
          >
            您的浏览器不支持视频播放
          </video>
          <!-- 音频标签（隐藏，与视频同步播放） -->
          <audio
            v-if="actualAudioUrl"
            ref="audioRef"
            :src="actualAudioUrl"
            @loadedmetadata="onAudioLoaded"
            @error="onAudioError"
          />
        </div>
      </div>
    </div>

    <!-- 视频信息区域 -->
    <div v-if="videoInfo" class="video-info bg-gray-900 text-white p-4">
      <!-- UP主信息 -->
      <div class="flex items-center mb-4">
        <div class="flex items-center flex-1" @click="openUpSpace">
          <img
            :src="videoInfo.upAvatarUrl ?? ''"
            :alt="videoInfo.upName ?? 'UP主'"
            class="w-10 h-10 rounded-full bg-gray-700"
            referrerpolicy="no-referrer"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;%3E%3Ccircle cx=&quot;50&quot; cy=&quot;50&quot; r=&quot;45&quot; fill=&quot;%234a5568&quot;/%3E%3Ctext x=&quot;50&quot; y=&quot;55&quot; text-anchor=&quot;middle&quot; fill=&quot;%23718096&quot; font-size=&quot;36&quot;%3E%E4%BA%BA%3C/text%3E%3C/svg%3E'"
          />
          <div class="ml-3">
            <p class="font-medium">{{ videoInfo.upName ?? '未知UP主' }}</p>
          </div>
        </div>
        <div class="text-xs text-white/50">
          {{ formatDate(videoInfo.publishAt) }}
        </div>
      </div>

      <!-- 视频标题 -->
      <h2 class="text-lg font-semibold mb-3">{{ videoInfo.title }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getVideoDetail, getVideoResource, type ListBilibiliVideoInfoResp } from '@/api/download'

// 路由
const router = useRouter()
const route = useRoute()

// 视频引用
const videoRef = ref<HTMLVideoElement | null>(null)
// 音频引用
const audioRef = ref<HTMLAudioElement | null>(null)

// 加载状态
const loading = ref(true)

// 视频信息
const videoInfo = ref<ListBilibiliVideoInfoResp | null>(null)

// 实际播放地址（已下载视频通过资源接口获取）
const actualVideoUrl = ref('')
// 实际音频播放地址（已下载视频通过资源接口获取）
const actualAudioUrl = ref('')

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (timestamp: number): string => {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 跳转到B站APP
const openInBilibili = () => {
  if (!videoInfo.value) return
  
  // 构建B站APP跳转链接
  const bilibiliUrl = `bilibili://video/${videoInfo.value.bvid}`
  
  // 尝试跳转到B站APP，如果失败则提示用户
  const startTime = Date.now()
  window.location.href = bilibiliUrl
  
  // 设置超时检查
  setTimeout(() => {
    const endTime = Date.now()
    // 如果在短时间内没有跳转成功，提示用户
    if (endTime - startTime < 2000) {
      showToast({
        message: '请确保已安装B站APP',
        position: 'top'
      })
    }
  }, 1500)
}

// 跳转到B站UP主主页
const openUpSpace = () => {
  if (!videoInfo.value) return
  
  const upUid = videoInfo.value.upUid
  if (!upUid) {
    showToast({
      message: 'UP主信息不存在',
      position: 'top'
    })
    return
  }
  
  // 优先尝试B站APP打开
  const appUrl = `bilibili://space/${upUid}`
  const webUrl = `https://space.bilibili.com/${upUid}`
  
  const startTime = Date.now()
  window.location.href = appUrl
  
  // 设置超时检查，如果短时间内没有跳转成功，改用浏览器打开
  setTimeout(() => {
    const endTime = Date.now()
    if (endTime - startTime < 2000) {
      window.location.href = webUrl
    }
  }, 1500)
}

// 视频加载完成
const onVideoLoaded = () => {
  loading.value = false
}

// 音频加载完成
const onAudioLoaded = () => {
  console.log('音频加载完成')
}

// 音频加载错误
const onAudioError = () => {
  console.error('音频加载失败')
  showToast({
    message: '音频加载失败',
    position: 'top'
  })
}

// 同步音频播放
const syncAudioPlay = () => {
  console.log('同步音频播放')
  if (audioRef.value && actualAudioUrl.value) {
    audioRef.value.play().catch(e => {
      console.log('音频播放失败:', e)
    })
  }
}

// 同步音频暂停
const syncAudioPause = () => {
  console.log('同步音频暂停')
  if (audioRef.value) {
    audioRef.value.pause()
  }
}

// 同步音频时间
const syncAudioTime = () => {
  if (audioRef.value && videoRef.value && actualAudioUrl.value) {
    // 当视频和音频时间差超过 0.1 秒时同步
    const timeDiff = Math.abs(videoRef.value.currentTime - audioRef.value.currentTime)
    if (timeDiff > 0.1) {
      console.log('同步音频时间: videoTime=', videoRef.value.currentTime, 'audioTime=', audioRef.value.currentTime)
      audioRef.value.currentTime = videoRef.value.currentTime
    }
  }
}

// 视频加载错误
const onVideoError = () => {
  loading.value = false
  showToast({
    message: '视频加载失败',
    position: 'top'
  })
}

// 视频可以播放
const onVideoCanPlay = () => {
  console.log('视频事件: canplay')
  loading.value = false
  if (videoRef.value) {
    videoRef.value.play().catch(e => {
      console.log('自动播放失败(浏览器策略):', e)
    })
  }
}

// 视频可以流畅播放
const onVideoCanPlayThrough = () => {
  console.log('视频事件: canplaythrough')
}

// 视频数据加载完成
const onVideoLoadedData = () => {
  console.log('视频事件: loadeddata')
}

// 视频等待中
const onVideoWaiting = () => {
  console.log('视频事件: waiting')
}

// 视频卡顿
const onVideoStalled = () => {
  console.log('视频事件: stalled')
}

// 获取视频信息
const fetchVideoInfo = async () => {
  const videoId = route.params.id
  const videoData = route.query.videoData as string

  if (!videoId) {
    showToast({
      message: '视频ID无效',
      position: 'top'
    })
    return
  }

  try {
    loading.value = true

    // 优先使用路由参数传递的视频数据
    if (videoData) {
      try {
        videoInfo.value = JSON.parse(videoData)
      } catch (error) {
        console.error('解析视频数据失败:', error)
        videoInfo.value = null
      }
    }

    // 如果没有路由参数，则请求接口获取视频详情
    if (!videoInfo.value) {
      videoInfo.value = await getVideoDetail(Number(videoId))
    }

    if (!videoInfo.value) {
      showToast({
        message: '视频不存在',
        position: 'top'
      })
      return
    }

    // console.log('视频信息:', videoInfo.value)
    // console.log('isDownload:', videoInfo.value.isDownload)
    // console.log('videoResourceName:', videoInfo.value.videoResourceName)
    // console.log('audioResourceName:', videoInfo.value.audioResourceName)
    // console.log('aid:', videoInfo.value.aid)

    // 如果是已下载视频，请求资源接口获取播放地址
    if (videoInfo.value.isDownload === 'Y') {
      const aid = videoInfo.value.aid
      if (!aid) {
        showToast({
          message: '视频aid为空，无法播放',
          position: 'top'
        })
        return
      }

      // 请求视频资源
      if (videoInfo.value.videoResourceName) {
        // console.log('视频资源请求参数:', { aid, resourceName: videoInfo.value.videoResourceName })
        try {
          const res = await getVideoResource(aid, videoInfo.value.videoResourceName, 'video')
          // console.log('视频资源返回:', res)
          actualVideoUrl.value = res.resourceUrl
          // console.log('实际播放地址:', actualVideoUrl.value)
        } catch (error) {
          // console.error('获取视频资源失败:', error)
          showToast({
            message: error instanceof Error ? error.message : '获取视频资源失败',
            position: 'top'
          })
        }
      } else {
        console.log('videoResourceName 为空，不请求资源')
      }

      // 请求音频资源
      if (videoInfo.value.audioResourceName) {
        // console.log('音频资源请求参数:', { aid, resourceName: videoInfo.value.audioResourceName })
        try {
          const res = await getVideoResource(aid, videoInfo.value.audioResourceName, 'audio')
          // console.log('音频资源返回:', res)
          actualAudioUrl.value = res.resourceUrl
          // console.log('实际音频地址:', actualAudioUrl.value)
        } catch (error) {
          // console.error('获取音频资源失败:', error)
          showToast({
            message: error instanceof Error ? error.message : '获取音频资源失败',
            position: 'top'
          })
        }
      } else {
        console.log('audioResourceName 为空，不请求音频')
      }
      
      // 关闭加载状态（视频标签会自行加载）
      loading.value = false
    } else {
      // 未下载视频，直接关闭 loading
      loading.value = false
    }
  } catch (error) {
    loading.value = false
    showToast({
      message: error instanceof Error ? error.message : '获取视频信息失败',
      position: 'top'
    })
  }
}

// 页面加载时获取视频信息
onMounted(() => {
  fetchVideoInfo()
})
</script>

<style scoped>
.video-player-page {
  min-height: 100vh;
}

.back-btn:active {
  opacity: 0.7;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-container {
  width: 100%;
  background: black;
}

.video-wrapper video {
  max-height: 60vh;
  object-fit: contain;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>