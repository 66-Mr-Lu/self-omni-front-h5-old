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
            v-model="inputText"
            type="text"
            class="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="请粘贴视频链接或包含链接的文本"
            @keyup.enter="handleAddToQueue"
          />
          <button
            class="px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm transition-all active:opacity-80"
            :disabled="isAddingQueue"
            :class="{ 'opacity-50 cursor-not-allowed': isAddingQueue }"
            @click="handleAddToQueue"
          >
            {{ isAddingQueue ? '提交中...' : '加入下载队列' }}
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">支持格式：完整链接、短链接、BV号，可直接粘贴包含链接的文本</p>
      </div>

      <!-- 提取结果提示 -->
      <div v-if="extractedUrl" class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
        <div class="flex items-start">
          <span class="text-blue-500 mr-2">🔍</span>
          <div>
            <p class="text-blue-700 text-sm font-medium">已提取链接</p>
            <p class="text-blue-600 text-xs mt-1 truncate">{{ extractedUrl }}</p>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
        <div class="flex items-start">
          <span class="text-red-500 mr-2">⚠️</span>
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 加入队列成功提示 -->
      <div v-if="queueSuccess" class="bg-green-50 border border-green-200 rounded-xl p-4 mt-3">
        <div class="flex items-start">
          <span class="text-green-500 mr-2">✅</span>
          <div>
            <p class="text-green-700 font-medium text-sm">已加入下载队列</p>
            <p v-if="queueResult?.videoTitle" class="text-green-600 text-xs mt-1">视频：{{ queueResult.videoTitle }}</p>
            <p v-if="queueResult" class="text-green-600 text-xs">队列位置：第 {{ queueResult.position }} 位</p>
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
          <li>2. 将链接粘贴到输入框中（支持直接粘贴包含链接的文本）</li>
          <li>3. 系统会自动提取并校验链接</li>
          <li>4. 点击「加入下载队列」按钮提交</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { processUrl, extractFirstUrl } from '@/utils/bilibiliParser'
import { addToDownloadQueue, type AddToQueueData } from '@/api/download'

// 路由
const router = useRouter()

// 输入文本
const inputText = ref('')

// 提取到的URL
const extractedUrl = ref('')

// 是否正在加入队列
const isAddingQueue = ref(false)

// 错误信息
const errorMessage = ref('')

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

// 监听输入变化，自动提取URL
watch(inputText, (newText) => {
  if (newText.trim()) {
    const url = extractFirstUrl(newText)
    extractedUrl.value = url || ''
  } else {
    extractedUrl.value = ''
  }
})

// 处理加入队列
const handleAddToQueue = async () => {
  const text = inputText.value.trim()
  
  // 验证输入
  if (!text) {
    errorMessage.value = '请输入视频链接或包含链接的文本'
    return
  }
  
  // 清除之前的状态
  errorMessage.value = ''
  queueSuccess.value = false
  queueResult.value = null
  queueError.value = ''
  
  // 设置加入队列状态
  isAddingQueue.value = true
  
  try {
    // 完整流程：从文本提取URL → 校验 → 解析为完整链接
    const fullUrl = await processUrl(text)
    
    // 调用后台接口加入下载队列
    queueResult.value = await addToDownloadQueue(fullUrl)
    
    queueSuccess.value = true
    showToast('已加入下载队列')
  } catch (error) {
    queueError.value = error instanceof Error ? error.message : '加入队列失败，请稍后重试'
    showToast('操作失败')
    console.error('操作失败:', error)
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

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>