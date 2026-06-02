<template>
  <div class="bilibili-download-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">Bilibili视频下载</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-14 px-3 pb-6">
      <!-- 链接输入区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-3">
        <label class="text-gray-700 font-medium text-sm mb-2 block">视频链接</label>
        <div class="flex gap-2">
          <input
            v-model="inputUrl"
            type="text"
            class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="请输入视频链接或BV号"
            @keyup.enter="handleParse"
          />
          <button
            class="px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm transition-all active:opacity-80"
            :disabled="isParsing"
            :class="{ 'opacity-50 cursor-not-allowed': isParsing }"
            @click="handleParse"
          >
            {{ isParsing ? '解析中...' : '解析' }}
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">支持格式：完整链接、短链接、BV号</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
        <div class="flex items-start">
          <span class="text-red-500 mr-2">⚠️</span>
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 视频信息卡片 -->
      <div v-if="videoInfo" class="bg-white rounded-xl shadow-sm p-4 mb-3">
        <div class="flex gap-3">
          <!-- 封面图 -->
          <div class="cover-wrapper w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img :src="videoInfo.coverUrl" :alt="videoInfo.title" class="w-full h-full object-cover" />
          </div>
          <!-- 视频信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="text-gray-800 font-medium text-sm line-clamp-2">{{ videoInfo.title }}</h3>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{{ videoInfo.upName }}</span>
              <span>{{ videoInfo.viewCount }}播放</span>
            </div>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>时长：{{ videoInfo.duration }}</span>
              <span>{{ videoInfo.danmakuCount }}弹幕</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 清晰度选择区域 -->
      <div v-if="videoInfo && videoInfo.qualityList.length > 0" class="bg-white rounded-xl shadow-sm p-4 mb-3">
        <label class="text-gray-700 font-medium text-sm mb-3 block">选择清晰度</label>
        <div class="space-y-2">
          <div
            v-for="quality in videoInfo.qualityList"
            :key="quality.id"
            class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer"
            :class="selectedQuality?.id === quality.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
            @click="selectQuality(quality)"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="selectedQuality?.id === quality.id ? 'border-primary' : 'border-gray-300'"
              >
                <div
                  v-if="selectedQuality?.id === quality.id"
                  class="w-3 h-3 rounded-full bg-primary"
                ></div>
              </div>
              <div>
                <span class="text-gray-800 font-medium text-sm">{{ quality.name }}</span>
                <span class="text-gray-400 text-xs ml-2">{{ quality.resolution }}</span>
              </div>
            </div>
            <span v-if="quality.size" class="text-gray-400 text-xs">{{ quality.size }}</span>
          </div>
        </div>
      </div>

      <!-- 加入队列按钮 -->
      <button
        v-if="videoInfo && selectedQuality"
        class="w-full bg-primary text-white py-3 rounded-xl font-medium transition-all active:opacity-80"
        :disabled="isAddingQueue"
        :class="{ 'opacity-50 cursor-not-allowed': isAddingQueue }"
        @click="handleAddToQueue"
      >
        {{ isAddingQueue ? '加入队列中...' : '加入下载队列' }}
      </button>

      <!-- 加入队列成功提示 -->
      <div v-if="queueSuccess" class="bg-green-50 border border-green-200 rounded-xl p-4 mt-3">
        <div class="flex items-start">
          <span class="text-green-500 mr-2">✅</span>
          <div>
            <p class="text-green-700 font-medium text-sm">已加入下载队列</p>
            <p v-if="queueResult" class="text-green-600 text-xs mt-1">队列位置：第 {{ queueResult.position }} 位</p>
            <p v-if="queueResult?.estimatedTime" class="text-green-600 text-xs">预计时间：{{ queueResult.estimatedTime }}</p>
          </div>
        </div>
      </div>

      <!-- 加入队列失败提示 -->
      <div v-if="queueError" class="bg-red-50 border border-red-200 rounded-xl p-4 mt-3">
        <div class="flex items-start">
          <span class="text-red-500 mr-2">❌</span>
          <div>
            <p class="text-red-700 font-medium text-sm">加入队列失败</p>
            <p class="text-red-600 text-xs mt-1">{{ queueError }}</p>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
        <h4 class="text-blue-800 font-medium text-sm mb-2">💡 使用说明</h4>
        <ul class="text-blue-600 text-xs space-y-1">
          <li>1. 在 Bilibili APP 或网页复制视频链接</li>
          <li>2. 将链接粘贴到输入框中</li>
          <li>3. 点击「解析」按钮获取视频信息</li>
          <li>4. 选择想要的清晰度后加入下载队列</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { parseBilibiliUrl, isValidBilibiliUrl } from '@/utils/bilibiliParser'
import { parseBilibiliVideo, addToDownloadQueue, type VideoInfo, type VideoQuality, type AddToQueueData } from '@/api/download'

// 路由
const router = useRouter()

// 输入链接
const inputUrl = ref('')

// 是否正在解析
const isParsing = ref(false)

// 错误信息
const errorMessage = ref('')

// 视频信息
const videoInfo = ref<VideoInfo | null>(null)

// 选中的清晰度
const selectedQuality = ref<VideoQuality | null>(null)

// 是否正在加入队列
const isAddingQueue = ref(false)

// 加入队列是否成功
const queueSuccess = ref(false)

// 队列结果
const queueResult = ref<AddToQueueData | null>(null)

// 队列错误信息
const queueError = ref('')

// 返回上一页
const goBack = () => {
  router.back()
}

// 解析视频
const handleParse = async () => {
  const url = inputUrl.value.trim()
  
  // 验证输入
  if (!url) {
    errorMessage.value = '请输入视频链接'
    return
  }
  
  if (!isValidBilibiliUrl(url)) {
    errorMessage.value = '请输入有效的Bilibili视频链接'
    return
  }
  
  // 清除之前的状态
  errorMessage.value = ''
  videoInfo.value = null
  selectedQuality.value = null
  queueSuccess.value = false
  queueResult.value = null
  queueError.value = ''
  
  // 设置解析状态
  isParsing.value = true
  
  try {
    // 解析链接为完整链接
    const fullUrl = await parseBilibiliUrl(url)
    
    // 调用后台接口获取视频信息
    videoInfo.value = await parseBilibiliVideo(fullUrl)
    
    // 默认选中最高清晰度
    if (videoInfo.value.qualityList.length > 0) {
      selectedQuality.value = videoInfo.value.qualityList[0]
    }
    
    showToast('解析成功')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '解析失败，请稍后重试'
    console.error('解析失败:', error)
  } finally {
    isParsing.value = false
  }
}

// 选择清晰度
const selectQuality = (quality: VideoQuality) => {
  selectedQuality.value = quality
}

// 处理加入队列
const handleAddToQueue = async () => {
  if (!selectedQuality.value || !videoInfo.value) {
    showToast('请先解析视频并选择清晰度')
    return
  }
  
  // 重置队列状态
  queueSuccess.value = false
  queueResult.value = null
  queueError.value = ''
  
  // 设置加入队列状态
  isAddingQueue.value = true
  
  try {
    // 解析链接为完整链接
    const fullUrl = await parseBilibiliUrl(inputUrl.value.trim())
    
    // 调用后台接口加入下载队列
    queueResult.value = await addToDownloadQueue(fullUrl, selectedQuality.value.id)
    
    queueSuccess.value = true
    showToast('已加入下载队列')
  } catch (error) {
    queueError.value = error instanceof Error ? error.message : '加入队列失败，请稍后重试'
    showToast('加入队列失败')
    console.error('加入队列失败:', error)
  } finally {
    isAddingQueue.value = false
  }
}
</script>

<style scoped>
.back-btn {
  font-size: 24px;
}

.back-btn:active {
  opacity: 0.7;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>