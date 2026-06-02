import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoInfo, VideoQuality, AddToQueueData } from '@/api/download'

// 下载状态管理
export const useDownloadStore = defineStore('download', () => {
  // 当前解析的视频信息
  const videoInfo = ref<VideoInfo | null>(null)

  // 选中的清晰度
  const selectedQuality = ref<VideoQuality | null>(null)

  // 是否正在解析
  const isParsing = ref(false)

  // 解析错误信息
  const parseError = ref('')

  // 是否正在加入队列
  const isAddingQueue = ref(false)

  // 加入队列是否成功
  const queueSuccess = ref(false)

  // 队列结果
  const queueResult = ref<AddToQueueData | null>(null)

  // 队列错误信息
  const queueError = ref('')

  // 设置解析状态
  const setParsing = (parsing: boolean) => {
    isParsing.value = parsing
  }

  // 设置解析错误
  const setParseError = (error: string) => {
    parseError.value = error
  }

  // 设置视频信息
  const setVideoInfo = (info: VideoInfo) => {
    videoInfo.value = info
    // 默认选中最高清晰度
    if (info.qualityList.length > 0) {
      selectedQuality.value = info.qualityList[0]
    }
  }

  // 选择清晰度
  const selectQuality = (quality: VideoQuality) => {
    selectedQuality.value = quality
  }

  // 设置加入队列状态
  const setAddingQueue = (adding: boolean) => {
    isAddingQueue.value = adding
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

  // 重置状态
  const resetState = () => {
    videoInfo.value = null
    selectedQuality.value = null
    parseError.value = ''
    queueSuccess.value = false
    queueResult.value = null
    queueError.value = ''
  }

  return {
    // 状态
    videoInfo,
    selectedQuality,
    isParsing,
    parseError,
    isAddingQueue,
    queueSuccess,
    queueResult,
    queueError,
    // 方法
    setParsing,
    setParseError,
    setVideoInfo,
    selectQuality,
    setAddingQueue,
    setQueueResult,
    setQueueError,
    resetState
  }
})