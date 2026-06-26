import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AddToQueueData } from '@/api/download'

// 下载状态管理
export const useDownloadStore = defineStore('download', () => {
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

  // 视频列表筛选条件：只显示已下载
  const showDownloadedOnly = ref(false)

  // 设置加入队列状态
  const setAddingQueue = (adding: boolean) => {
    isAddingQueue.value = adding
  }

  // 设置错误信息
  const setErrorMessage = (error: string) => {
    errorMessage.value = error
  }

  // 设置队列结果
  const setQueueResult = (result: AddToQueueData) => {
    queueResult.value = result
    queueSuccess.value = true
    queueError.value = ''
  }

  // 设置队列错误
  const setQueueError = (error: string) => {
    queueError.value = error
    queueSuccess.value = false
  }

  // 设置筛选条件
  const setShowDownloadedOnly = (show: boolean) => {
    showDownloadedOnly.value = show
  }

  // 重置状态
  const resetState = () => {
    errorMessage.value = ''
    queueSuccess.value = false
    queueResult.value = null
    queueError.value = ''
  }

  return {
    // 状态
    isAddingQueue,
    errorMessage,
    queueSuccess,
    queueResult,
    queueError,
    showDownloadedOnly,
    // 方法
    setAddingQueue,
    setErrorMessage,
    setQueueResult,
    setQueueError,
    setShowDownloadedOnly,
    resetState
  }
})